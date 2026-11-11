package server

import (
	"errors"
	"net/http"
	"time"

	"gebed/internal/metrics"
)

// repoMetrics measures one repo: its beads and the reports in their comments.
func (a *api) repoMetrics(w http.ResponseWriter, r *http.Request) {
	repo, ok := a.reg.Find(r.PathValue("name"))
	if !ok {
		fail(w, http.StatusNotFound, errors.New("unknown repo"))
		return
	}
	if _, err := a.searchDocs(r.Context(), repo); err != nil { // reads the comments once and keeps the reports
		fail(w, http.StatusBadGateway, err)
		return
	}
	sn, err := a.snapshot(r.Context(), repo)
	if err != nil {
		fail(w, http.StatusBadGateway, err)
		return
	}
	a.snaps.mu.Lock()
	items := make([]metrics.Item, len(sn.beads))
	for i, b := range sn.beads {
		items[i].Bead = b
		if i < len(sn.reports) {
			items[i].Reports = sn.reports[i]
		}
	}
	a.snaps.mu.Unlock()
	reply(w, http.StatusOK, metrics.Compute(time.Now(), time.Local, items))
}
