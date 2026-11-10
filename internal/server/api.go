package server

import (
	"encoding/json"
	"errors"
	"net/http"
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
	// Unix milliseconds, for the waterfall; ClosedMs is nil while the bead is open.
	CreatedMs int64  `json:"createdMs"`
	UpdatedMs int64  `json:"updatedMs"`
	ClosedMs  *int64 `json:"closedMs"`
}

func toJSON(b model.Bead) beadJSON {
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
	return beadJSON{
		ID: b.ID.String(), Title: b.Title, Description: b.Description, Design: b.Design,
		Acceptance: b.Acceptance, Notes: b.Notes, Status: b.Status.String(), Kind: b.Kind.String(),
		Priority: b.Priority.Int(), Assignee: b.Assignee, Owner: b.Owner, Labels: labels,
		Created: b.Created, Updated: b.Updated, Closed: b.Closed, CloseReason: b.CloseReason,
		DepCount: b.DepCount, DependentCount: b.DependentCount, Deps: deps,
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
	repo, err := a.reg.Add(in.Dir)
	if err != nil {
		fail(w, http.StatusUnprocessableEntity, err)
		return
	}
	reply(w, http.StatusCreated, repo)
}

func (a *api) listBeads(w http.ResponseWriter, r *http.Request) {
	s, ok := a.open(w, r)
	if !ok {
		return
	}
	bs, err := s.List(r.Context())
	if err != nil {
		fail(w, http.StatusBadGateway, err)
		return
	}
	out := make([]beadJSON, 0, len(bs))
	for _, b := range bs {
		out = append(out, toJSON(b))
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
	reply(w, http.StatusOK, toJSON(b))
}
