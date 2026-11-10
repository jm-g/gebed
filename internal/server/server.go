// Package server serves the embedded Elm bundle and the JSON API.
package server

import (
	"embed"
	"io/fs"
	"net/http"

	"gebed/internal/registry"
	"gebed/internal/store"
	"gebed/internal/theme"
)

//go:embed static
var static embed.FS

// New serves the web bundle at / and the JSON API under /api.
func New(reg *registry.Registry, run store.Runner, themes func() []theme.Scheme, peers Peers, user string) http.Handler {
	sub, err := fs.Sub(static, "static")
	if err != nil {
		panic(err) // static is embedded at build time; Sub only fails on a bad path literal
	}
	a := &api{reg: reg, run: run, themes: themes, peers: peers, user: user}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/repos", a.listRepos)
	mux.HandleFunc("GET /api/themes", a.listThemes)
	mux.HandleFunc("POST /api/repos", a.addRepo)
	mux.HandleFunc("GET /api/repos/{name}/beads", a.listBeads)
	mux.HandleFunc("GET /api/repos/{name}/beads/{id}", a.getBead)
	mux.HandleFunc("POST /api/repos/{name}/ops", a.applyOp)
	mux.HandleFunc("GET /api/repos/{name}/beads/{id}/comments", a.listComments)
	mux.HandleFunc("GET /api/sessions", a.listSessions)
	mux.HandleFunc("GET /api/repos/{name}/version", a.version)
	mux.Handle("/", http.FileServerFS(sub))
	return mux
}
