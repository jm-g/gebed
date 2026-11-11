package server

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"

	"gebed/internal/model"
	"gebed/internal/peer"
	"gebed/internal/registry"
	"gebed/internal/store"
	"gebed/internal/theme"
)

// Peers lists live Claude sessions and sends them a message.
type Peers interface {
	List() ([]peer.Session, error)
	Send(s peer.Session, body string) error
}

type api struct {
	reg    *registry.Registry
	run    store.Runner
	themes func() []theme.Scheme
	peers  Peers
	user   string // author of comments written in the UI
	snaps  snapshots
	write  sync.Mutex
}

type repoJSON struct {
	Name    string `json:"name"`
	Dir     string `json:"dir"`
	Backend string `json:"backend"`
}

type depJSON struct {
	On   string `json:"on"`
	Type string `json:"type"`
}

type beadJSON struct {
	ID             string     `json:"id"`
	Title          string     `json:"title"`
	Description    string     `json:"description"`
	Design         string     `json:"design"`
	Acceptance     string     `json:"acceptance"`
	Notes          string     `json:"notes"`
	Status         string     `json:"status"`
	Kind           string     `json:"kind"`
	Priority       int        `json:"priority"`
	Assignee       string     `json:"assignee"`
	Owner          string     `json:"owner"`
	Labels         []string   `json:"labels"`
	Created        time.Time  `json:"created"`
	Updated        time.Time  `json:"updated"`
	Closed         *time.Time `json:"closed"`
	CloseReason    string     `json:"closeReason"`
	DepCount       int        `json:"depCount"`
	DependentCount int        `json:"dependentCount"`
	Deps           []depJSON  `json:"deps"`
	Epics          []epicJSON `json:"epics"`
	// Unix milliseconds, for the waterfall; ClosedMs is nil while the bead is open.
	// Due is the delivery day (YYYY-MM-DD in the local zone, empty when unset); the
	// planned start is Due minus EstDays. EstDays is 0 when no estimate is set.
	Due     string `json:"due"`
	EstDays int    `json:"estDays"`
	// The exact delivery time (Unix ms, nil when unset) and length in minutes, for the
	// waterfall at hour and minute zoom.
	DueMs     *int64 `json:"dueMs"`
	EstMin    int    `json:"estMin"`
	CreatedMs int64  `json:"createdMs"`
	UpdatedMs int64  `json:"updatedMs"`
	ClosedMs  *int64 `json:"closedMs"`
}

func toJSON(b model.Bead, epics []epicJSON) beadJSON {
	if epics == nil {
		epics = []epicJSON{}
	}
	deps := make([]depJSON, 0, len(b.Deps))
	for _, d := range b.Deps {
		deps = append(deps, depJSON{d.On.String(), d.Type.String()})
	}
	labels := b.Labels
	if labels == nil {
		labels = []string{}
	}
	var closedMs *int64
	if b.Closed != nil {
		m := b.Closed.UnixMilli()
		closedMs = &m
	}
	var dueMs *int64
	due, est := "", 0
	if b.Due != nil {
		m := b.Due.UnixMilli()
		dueMs = &m
		due = model.DateOf(*b.Due, time.Local).String()
	}
	if b.EstimateMin > 0 {
		est = model.DaysOfMinutes(b.EstimateMin).Int()
	}
	return beadJSON{
		ID: b.ID.String(), Title: b.Title, Description: b.Description, Design: b.Design,
		Acceptance: b.Acceptance, Notes: b.Notes, Status: b.Status.String(), Kind: b.Kind.String(),
		Priority: b.Priority.Int(), Assignee: b.Assignee, Owner: b.Owner, Labels: labels,
		Created: b.Created, Updated: b.Updated, Closed: b.Closed, CloseReason: b.CloseReason,
		DepCount: b.DepCount, DependentCount: b.DependentCount, Deps: deps,
		Epics: epics,
		Due:   due, EstDays: est, DueMs: dueMs, EstMin: b.EstimateMin,
		CreatedMs: b.Created.UnixMilli(), UpdatedMs: b.Updated.UnixMilli(), ClosedMs: closedMs,
	}
}

func reply(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v) // the client went away if this fails
}

func fail(w http.ResponseWriter, code int, err error) {
	reply(w, code, map[string]string{"error": err.Error()})
}

func (a *api) open(w http.ResponseWriter, r *http.Request) (*store.CLI, bool) {
	repo, ok := a.reg.Find(r.PathValue("name"))
	if !ok {
		fail(w, http.StatusNotFound, errors.New("unknown repo"))
		return nil, false
	}
	s, err := store.Open(repo.Dir, a.run)
	if err != nil {
		fail(w, http.StatusBadGateway, err)
		return nil, false
	}
	return s, true
}

func (a *api) listThemes(w http.ResponseWriter, _ *http.Request) {
	reply(w, http.StatusOK, a.themes())
}

func (a *api) listRepos(w http.ResponseWriter, _ *http.Request) {
	out := []repoJSON{}
	for _, r := range a.reg.List() {
		b, err := store.Detect(r.Dir)
		if err != nil {
			continue // .beads vanished; the repo stays registered but is not shown
		}
		out = append(out, repoJSON{r.Name, r.Dir, b.String()})
	}
	reply(w, http.StatusOK, out)
}

func (a *api) addRepo(w http.ResponseWriter, r *http.Request) {
	var in struct {
		Dir string `json:"dir"`
	}
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<16)).Decode(&in); err != nil {
		fail(w, http.StatusBadRequest, err)
		return
	}
	// one repo per line, as "path" or "name:path"; each is added on its own, and a failing line is reported
	var first registry.Repo
	var errs []error
	for _, line := range strings.Split(in.Dir, "\n") {
		if strings.TrimSpace(line) == "" {
			continue
		}
		name, dir := registry.ParseLine(line)
		repo, err := a.reg.AddNamed(name, dir)
		if err != nil {
			errs = append(errs, fmt.Errorf("%s: %w", dir, err))
			continue
		}
		if first.Name == "" {
			first = repo
		}
	}
	if len(errs) > 0 {
		fail(w, http.StatusUnprocessableEntity, errors.Join(errs...))
		return
	}
	if first.Name == "" {
		fail(w, http.StatusBadRequest, errors.New("give one directory per line"))
		return
	}
	reply(w, http.StatusCreated, first)
}

// removeRepo unregisters a repo; its directory and beads stay on disk.
func (a *api) removeRepo(w http.ResponseWriter, r *http.Request) {
	if _, err := a.reg.Remove(r.PathValue("name")); err != nil {
		fail(w, http.StatusNotFound, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (a *api) listBeads(w http.ResponseWriter, r *http.Request) {
	repo, ok := a.reg.Find(r.PathValue("name"))
	if !ok {
		fail(w, http.StatusNotFound, errors.New("unknown repo"))
		return
	}
	sn, err := a.snapshot(r.Context(), repo)
	if err != nil {
		fail(w, http.StatusBadGateway, err)
		return
	}
	a.warmDocs(repo, sn)
	out := make([]beadJSON, 0, len(sn.beads))
	for _, b := range sn.beads {
		out = append(out, toJSON(b, sn.epics[b.ID.String()]))
	}
	reply(w, http.StatusOK, out)
}

func (a *api) getBead(w http.ResponseWriter, r *http.Request) {
	s, ok := a.open(w, r)
	if !ok {
		return
	}
	id, err := model.ParseID(r.PathValue("id"))
	if err != nil {
		fail(w, http.StatusBadRequest, err)
		return
	}
	b, err := s.Get(r.Context(), id)
	if err != nil {
		fail(w, http.StatusBadGateway, err)
		return
	}
	var epics []epicJSON
	if repo, ok := a.reg.Find(r.PathValue("name")); ok {
		if sn, err := a.snapshot(r.Context(), repo); err == nil {
			epics = sn.epics[id.String()]
		}
	}
	reply(w, http.StatusOK, toJSON(b, epics))
}
