// Package server serves the embedded Elm bundle and the JSON API.
package server

import (
	"context"
	"embed"
	"io/fs"
	"net/http"

	"gebed/internal/registry"
	"gebed/internal/store"
	"gebed/internal/theme"
)

//go:embed static
var static embed.FS

// Server is the http handler of gebed, with a way to warm its caches.
type Server struct {
	http.Handler
	a   *api
	reg *registry.Registry
}

// New serves the web bundle at / and the JSON API under /api.
func New(reg *registry.Registry, run store.Runner, themes func() []theme.Scheme, peers Peers, user string) *Server {
	sub, err := fs.Sub(static, "static")
	if err != nil {
		panic(err) // static is embedded at build time; Sub only fails on a bad path literal
	}
	a := &api{reg: reg, run: run, themes: themes, peers: peers, user: user}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/repos", a.listRepos)
	mux.HandleFunc("GET /api/themes", a.listThemes)
	mux.HandleFunc("POST /api/repos", a.addRepo)
	mux.HandleFunc("DELETE /api/repos/{name}", a.removeRepo)
	mux.HandleFunc("GET /api/repos/{name}/beads", a.listBeads)
	mux.HandleFunc("GET /api/repos/{name}/beads/{id}", a.getBead)
	mux.HandleFunc("POST /api/repos/{name}/ops", a.applyOp)
	mux.HandleFunc("GET /api/repos/{name}/beads/{id}/comments", a.listComments)
	mux.HandleFunc("GET /api/sessions", a.listSessions)
	mux.HandleFunc("GET /api/links", a.links)
	mux.HandleFunc("GET /api/repos/{name}/metrics", a.repoMetrics)
	mux.HandleFunc("GET /api/search", a.searchAll)
	mux.HandleFunc("GET /api/repos/{name}/edges", a.listEdges)
	mux.HandleFunc("GET /api/repos/{name}/version", a.version)
	mux.Handle("/", http.FileServerFS(sub))
	return &Server{Handler: mux, a: a, reg: reg}
}

// Warm reads every registered repo in the background: its beads and edges, and
// the text and reports that search and metrics need. The first search or metrics
// view then does not wait for hundreds of CLI calls, and a slow backend such as
// bd does not stall it.
func (s *Server) Warm() {
	for _, repo := range s.reg.List() {
		go func() { _, _ = s.a.searchDocs(context.Background(), repo) }() // a failure only means the first use builds it
	}
}
