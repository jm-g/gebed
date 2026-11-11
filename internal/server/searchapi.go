package server

import (
	"errors"
	"net/http"
	"sort"
	"strconv"
	"time"

	"gebed/internal/search"
)

var errBadMode = errors.New("mode must be fuzzy or exact")

func localZone() *time.Location { return time.Local }

// searchAll runs the query over every registered repo and merges the results.
// mode is "fuzzy" or "exact"; anything else is rejected.
func (a *api) searchAll(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	mode := q.Get("mode")
	if mode != "fuzzy" && mode != "exact" {
		fail(w, http.StatusBadRequest, errBadMode)
		return
	}
	limit := 50
	if n, err := strconv.Atoi(q.Get("limit")); err == nil && n > 0 && n <= 200 {
		limit = n
	}
	var hits []search.Hit
	errs := map[string]string{}
	for _, repo := range a.reg.List() {
		docs, err := a.searchDocs(r.Context(), repo)
		if err != nil {
			errs[repo.Name] = err.Error()
			continue
		}
		if mode == "fuzzy" {
			hits = append(hits, search.Fuzzy(q.Get("q"), docs, limit)...)
		} else {
			hits = append(hits, search.Exact(q.Get("q"), docs, limit)...)
		}
	}
	sort.SliceStable(hits, func(i, j int) bool { return hits[i].Score > hits[j].Score })
	if len(hits) > limit {
		hits = hits[:limit]
	}
	if hits == nil {
		hits = []search.Hit{}
	}
	reply(w, http.StatusOK, struct {
		Hits   []search.Hit      `json:"hits"`
		Errors map[string]string `json:"errors"`
	}{hits, errs})
}
