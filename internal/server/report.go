package server

import (
	"net/http"
	"strings"

	"gebed/internal/model"
	"gebed/internal/store"
)

// applyReport records what an agent measured: the report as a comment (the
// full record) and the metrics that boards filter on as labels. It replaces the
// bead's earlier outcome and complexity labels, and sets a weight label only when
// nobody has weighed the bead yet, so a planner's weight is kept.
func (a *api) applyReport(w http.ResponseWriter, r *http.Request, s *store.CLI, in opJSON) {
	id, err := model.ParseID(in.ID)
	if err != nil {
		fail(w, http.StatusUnprocessableEntity, err)
		return
	}
	rep, err := model.NewReport(in.Agent, in.Outcome, in.Weight, in.Complexity, in.Minutes, in.Attempts, in.Tokens, in.CostCents, in.TestsPass, in.TestsFail, in.Capacity, in.Confidence, in.Findings)
	if err != nil {
		fail(w, http.StatusUnprocessableEntity, err)
		return
	}
	who := rep.Agent
	if who == "" {
		who = a.user
	}
	author, err := model.ParseAuthor(who)
	if err != nil {
		fail(w, http.StatusUnprocessableEntity, err)
		return
	}
	body, err := model.ParseBody(rep.String())
	if err != nil {
		fail(w, http.StatusUnprocessableEntity, err)
		return
	}

	a.write.Lock()
	defer a.write.Unlock()
	bead, err := s.Get(r.Context(), id)
	if err != nil {
		fail(w, http.StatusBadGateway, err)
		return
	}
	do := func(op store.Op) bool {
		if _, err := s.Apply(r.Context(), op); err != nil {
			fail(w, http.StatusBadGateway, err)
			return false
		}
		return true
	}
	for _, old := range bead.Labels {
		if strings.HasPrefix(old, "outcome:") || (strings.HasPrefix(old, "complexity:") && rep.Complexity > 0) {
			l, err := model.ParseLabel(old)
			if err == nil && !do(store.RemoveLabel{ID: id, Label: l}) {
				return
			}
		}
	}
	for _, l := range rep.Labels() {
		if strings.HasPrefix(l, "weight:") && model.LabelInt(bead.Labels, "weight") > 0 {
			continue // a planner's weight stays
		}
		lab, err := model.ParseLabel(l)
		if err != nil {
			fail(w, http.StatusUnprocessableEntity, err)
			return
		}
		if !do(store.AddLabel{ID: id, Label: lab}) {
			return
		}
	}
	if !do(store.AddComment{ID: id, Author: author, Body: body}) {
		return
	}
	a.snaps.mu.Lock()
	delete(a.snaps.by, r.PathValue("name")) // the next read sees the new report
	a.snaps.mu.Unlock()
	repo, _ := a.reg.Find(r.PathValue("name"))
	reply(w, http.StatusOK, struct {
		ID        string         `json:"id"`
		Delivered []deliveryJSON `json:"delivered"`
	}{id.String(), append([]deliveryJSON{}, a.notify(repo, s.Backend, id, body)...)})
}
