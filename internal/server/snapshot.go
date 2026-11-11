package server

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"gebed/internal/model"
	"gebed/internal/registry"
	"gebed/internal/search"
	"gebed/internal/store"
)

// snap is everything read from one repo at one store state. It is rebuilt when
// the store fingerprint changes, so br and bd are asked once per change and not
// once per request.
type snap struct {
	fp    string
	beads []model.Bead
	edges []model.Edge
	epics map[string][]epicJSON // bead id -> the epics it belongs to
	docs  []search.Doc          // built on first search, or by the warm-up
	built bool
	warm  bool // a warm-up is running or done
}

type epicJSON struct {
	ID    string `json:"id"`
	Title string `json:"title"`
}

type snapshots struct {
	mu sync.Mutex
	by map[string]*snap
}

// snapshot returns the repo's current snapshot, reading the CLI only when the
// store changed since the last one.
func (a *api) snapshot(ctx context.Context, repo registry.Repo) (*snap, error) {
	a.snaps.mu.Lock()
	defer a.snaps.mu.Unlock()
	fp := fingerprint(repo.Dir)
	if s := a.snaps.by[repo.Name]; s != nil && s.fp == fp {
		return s, nil
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
	if a.snaps.by == nil {
		a.snaps.by = map[string]*snap{}
	}
	a.snaps.by[repo.Name] = s
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
// gives, the long text only `show` gives, and the discussion. It runs a bounded
// number of CLI calls at once and is cached with the snapshot.
func (a *api) searchDocs(ctx context.Context, repo registry.Repo) ([]search.Doc, error) {
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
	a.snaps.mu.Unlock()

	st, err := store.Open(repo.Dir, a.run)
	if err != nil {
		return nil, err
	}
	docs := make([]search.Doc, len(s.beads))
	var wg sync.WaitGroup
	sem := make(chan struct{}, docWorkers)
	var firstErr error
	var errMu sync.Mutex
	for i, b := range s.beads {
		wg.Add(1)
		sem <- struct{}{}
		go func() {
			defer func() { <-sem; wg.Done() }()
			full, err := st.Get(ctx, b.ID)
			if err != nil {
				full = b // the list row is still searchable
				errMu.Lock()
				if firstErr == nil {
					firstErr = err
				}
				errMu.Unlock()
			}
			cs, _ := st.Comments(ctx, b.ID) // a bead without readable comments is still found by the rest
			docs[i] = docOf(repo.Name, full, s.epics[b.ID.String()], cs)
		}()
	}
	wg.Wait()
	if firstErr != nil && len(docs) > 0 {
		// partial docs are still useful; do not cache them so the next search retries
		return docs, nil
	}
	a.snaps.mu.Lock()
	s.docs, s.built = docs, true
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
