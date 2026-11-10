package server

import (
	"net/http"

	"gebed/internal/model"
	"gebed/internal/store"
)

type endJSON struct {
	Repo   string `json:"repo"`
	ID     string `json:"id"`
	Title  string `json:"title"`
	Status string `json:"status"`
	// Found is false when the repo is not registered or has no such bead; Title
	// and Status are then empty and the link is dangling.
	Found bool `json:"found"`
}

type linkJSON struct {
	From endJSON `json:"from"`
	To   endJSON `json:"to"`
	Type string  `json:"type"`
}

// links lists every cross-repo dependency of every registered repo, each end
// resolved to its current title and status. A repo that fails to list is
// reported in errors, and its links are left out: a partial answer says so.
func (a *api) links(w http.ResponseWriter, r *http.Request) {
	beads := map[string]map[string]model.Bead{} // repo -> id -> bead
	failed := map[string]string{}
	load := func(name string) map[string]model.Bead {
		if m, ok := beads[name]; ok {
			return m
		}
		var m map[string]model.Bead
		if repo, ok := a.reg.Find(name); ok {
			if s, err := store.Open(repo.Dir, a.run); err != nil {
				failed[name] = err.Error()
			} else if bs, err := s.List(r.Context()); err != nil {
				failed[name] = err.Error()
			} else {
				m = make(map[string]model.Bead, len(bs))
				for _, b := range bs {
					m[b.ID.String()] = b
				}
			}
		}
		beads[name] = m // nil for an unknown or failed repo: looked up once
		return m
	}
	end := func(repo, id string) endJSON {
		e := endJSON{Repo: repo, ID: id}
		if b, ok := load(repo)[id]; ok {
			e.Title, e.Status, e.Found = b.Title, b.Status.String(), true
		}
		return e
	}

	out := []linkJSON{}
	for _, repo := range a.reg.List() {
		bs := load(repo.Name)
		if bs == nil {
			continue
		}
		s, err := store.Open(repo.Dir, a.run)
		if err != nil {
			failed[repo.Name] = err.Error()
			continue
		}
		list := make([]model.Bead, 0, len(bs))
		for _, b := range bs {
			list = append(list, b)
		}
		es, err := s.Edges(r.Context(), list)
		if err != nil {
			failed[repo.Name] = err.Error()
			continue
		}
		for _, e := range es {
			if e.To.Project == "" {
				continue
			}
			out = append(out, linkJSON{
				From: end(repo.Name, e.From.String()),
				To:   end(e.To.Project, e.To.ID.String()),
				Type: e.Type.String(),
			})
		}
	}
	reply(w, http.StatusOK, struct {
		Links  []linkJSON        `json:"links"`
		Errors map[string]string `json:"errors"`
	}{out, failed})
}
