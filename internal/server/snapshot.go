package server

import (
	"context"
	"fmt"
	"strings"
	"sync"
	"time"

	"gebed/internal/metrics"
	"gebed/internal/model"
	"gebed/internal/registry"
	"gebed/internal/search"
	"gebed/internal/store"
)

// snap is everything read from one repo at one store state. It is rebuilt when
// the store fingerprint changes, so br and bd are asked once per change and not
// once per request.
type snap struct {
	fp      string
	beads   []model.Bead
	edges   []model.Edge
	epics   map[string][]epicJSON // bead id -> the epics it belongs to
	docs    []search.Doc          // built on first search, or by the warm-up
	reports [][]metrics.Stamped   // the agents' reports per bead (same order as beads), built with the docs
	built   bool
	warm    bool // a warm-up is running or done
}

type epicJSON struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

// docKey says whether a bead's search document is still current. br bumps a
// bead's update time on a comment and bd does not, so the comment count is part
// of it; the epics are part of it because they are searchable text.
type docKey struct {
	updated  time.Time
	comments int
	epics    string
}

type docEntry struct {
	key  docKey
	doc  search.Doc
	reps []metrics.Stamped
}

func keyOf(b model.Bead, epics []epicJSON) docKey {
	var e []string
	for _, x := range epics {
		e = append(e, x.ID+" "+x.Title)
	}
	return docKey{b.Updated, b.CommentCount, strings.Join(e, "|")}
}

// snapshots keeps one snapshot per repo and, across snapshots, the documents of
// beads that did not change, so an edit costs two CLI calls and not hundreds.
type snapshots struct {
	mu    sync.Mutex // guards the maps and the fields of every snap, never held across a CLI call
	by    map[string]*snap
	docs  map[string]map[string]docEntry // repo -> bead id -> document
	locks map[string]*sync.Mutex         // one per repo and job, so a slow repo does not stall the others
}

func (s *snapshots) lockFor(name string) *sync.Mutex {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.locks == nil {
		s.locks = map[string]*sync.Mutex{}
	}
	m := s.locks[name]
	if m == nil {
		m = &sync.Mutex{}
		s.locks[name] = m
	}
	return m
}

// snapshot returns the repo's current snapshot, reading the CLI only when the
// store changed since the last one.
func (a *api) snapshot(ctx context.Context, repo registry.Repo) (*snap, error) {
	l := a.snaps.lockFor("snap:" + repo.Name)
	l.Lock()
	defer l.Unlock()
	fp := fingerprint(repo.Dir)
	a.snaps.mu.Lock()
	cur := a.snaps.by[repo.Name]
	a.snaps.mu.Unlock()
	if cur != nil && cur.fp == fp {
		return cur, nil
	}
	st, err := store.Open(repo.Dir, a.run)
	if err != nil {
		return nil, err
	}
	bs, err := st.List(ctx)
	if err != nil {
		return nil, err
	}
	es, err := st.Edges(ctx, bs)
	if err != nil {
		return nil, err
	}
	s := &snap{fp: fp, beads: bs, edges: es, epics: epicsOf(bs, es)}
	a.snaps.mu.Lock()
	if a.snaps.by == nil {
		a.snaps.by = map[string]*snap{}
	}
	a.snaps.by[repo.Name] = s
	a.snaps.mu.Unlock()
	return s, nil
}

// epicsOf finds, for each bead, the epics it belongs to: the targets of its
// parent-child edges that are beads of kind epic in the same repo.
func epicsOf(bs []model.Bead, es []model.Edge) map[string][]epicJSON {
	epic := map[string]model.Bead{}
	for _, b := range bs {
		if b.Kind == model.Epic {
			epic[b.ID.String()] = b
		}
	}
	out := map[string][]epicJSON{}
	for _, e := range es {
		if e.Type != model.ParentChild || e.To.Project != "" {
			continue
		}
		if p, ok := epic[e.To.ID.String()]; ok {
			out[e.From.String()] = append(out[e.From.String()], epicJSON{p.ID.String(), p.Title})
		}
	}
	return out
}

const docWorkers = 8

// searchDocs builds the searchable text of every bead: the fields the list
// gives, the long text only `show` gives, and the discussion. A bead whose key
// did not change keeps its earlier document; only changed beads cost CLI calls,
// at most docWorkers at once.
func (a *api) searchDocs(ctx context.Context, repo registry.Repo) ([]search.Doc, error) {
	dl := a.snaps.lockFor("docs:" + repo.Name)
	dl.Lock()
	defer dl.Unlock()
	s, err := a.snapshot(ctx, repo)
	if err != nil {
		return nil, err
	}
	a.snaps.mu.Lock()
	if s.built {
		d := s.docs
		a.snaps.mu.Unlock()
		return d, nil
	}
	old := a.snaps.docs[repo.Name]
	a.snaps.mu.Unlock()

	st, err := store.Open(repo.Dir, a.run)
	if err != nil {
		return nil, err
	}
	docs := make([]search.Doc, len(s.beads))
	reps := make([][]metrics.Stamped, len(s.beads))
	keys := make([]docKey, len(s.beads))
	good := make([]bool, len(s.beads))
	var wg sync.WaitGroup
	sem := make(chan struct{}, docWorkers)
	for i, b := range s.beads {
		keys[i] = keyOf(b, s.epics[b.ID.String()])
		if e, ok := old[b.ID.String()]; ok && e.key == keys[i] {
			docs[i], reps[i], good[i] = e.doc, e.reps, true
			continue
		}
		wg.Add(1)
		sem <- struct{}{}
		go func() {
			defer func() { <-sem; wg.Done() }()
			full, err := st.Get(ctx, b.ID)
			if err != nil {
				full = b // the list row is still searchable, but this document is not kept
			}
			cs, cerr := st.Comments(ctx, b.ID)
			reps[i] = reportsOf(cs)
			docs[i] = docOf(repo.Name, full, s.epics[b.ID.String()], cs)
			good[i] = err == nil && cerr == nil
		}()
	}
	wg.Wait()

	kept := map[string]docEntry{}
	complete := true
	for i, b := range s.beads {
		if good[i] {
			kept[b.ID.String()] = docEntry{keys[i], docs[i], reps[i]}
		} else {
			complete = false
		}
	}
	a.snaps.mu.Lock()
	if a.snaps.docs == nil {
		a.snaps.docs = map[string]map[string]docEntry{}
	}
	a.snaps.docs[repo.Name] = kept
	if complete { // partial documents are still returned, but the next search retries
		s.docs, s.reports, s.built = docs, reps, true
	}
	a.snaps.mu.Unlock()
	return docs, nil
}

func docOf(repo string, b model.Bead, epics []epicJSON, cs []model.Comment) search.Doc {
	f := func(name, text string, w int) search.Field { return search.Field{Name: name, Text: text, Weight: w} }
	fields := []search.Field{
		f("id", b.ID.String(), 4),
		f("title", b.Title, 3),
		f("labels", strings.Join(b.Labels, " "), 2),
		f("status", b.Status.String(), 1),
		f("kind", b.Kind.String(), 1),
		f("priority", fmt.Sprintf("P%d", b.Priority.Int()), 1),
		f("assignee", b.Assignee, 1),
		f("owner", b.Owner, 1),
		f("description", b.Description, 1),
		f("design", b.Design, 1),
		f("acceptance", b.Acceptance, 1),
		f("notes", b.Notes, 1),
		f("created", model.DateOf(b.Created, localZone()).String(), 1),
		f("updated", model.DateOf(b.Updated, localZone()).String(), 1),
	}
	if b.Due != nil {
		fields = append(fields, f("due", model.DateOf(*b.Due, localZone()).String(), 1))
	}
	if b.Closed != nil {
		fields = append(fields, f("closed", model.DateOf(*b.Closed, localZone()).String(), 1))
	}
	for _, e := range epics {
		fields = append(fields, f("epic", e.ID+" "+e.Title, 2))
	}
	for _, c := range cs {
		fields = append(fields, f("comment", c.Author.String()+": "+c.Body.String(), 1))
	}
	return search.Doc{Repo: repo, ID: b.ID.String(), Title: b.Title, Status: b.Status.String(), Fields: fields}
}

// warmDocs builds the search docs of a repo in the background, once per
// snapshot, so the first search does not wait for hundreds of CLI calls.
func (a *api) warmDocs(repo registry.Repo, s *snap) {
	a.snaps.mu.Lock()
	if s.warm {
		a.snaps.mu.Unlock()
		return
	}
	s.warm = true
	a.snaps.mu.Unlock()
	go func() { _, _ = a.searchDocs(context.Background(), repo) }() // a failure here only means the first search builds them itself
}

// reportsOf picks the agent reports out of a bead's comments, oldest first. A
// comment that looks like a report but is invalid is left out: it is still a
// comment in the discussion.
func reportsOf(cs []model.Comment) []metrics.Stamped {
	var out []metrics.Stamped
	for _, c := range cs {
		if r, ok, err := model.ParseReport(c.Body.String()); ok && err == nil {
			out = append(out, metrics.Stamped{Report: r, At: c.Created})
		}
	}
	return out
}
