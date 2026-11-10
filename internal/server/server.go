// Package server serves the embedded Elm bundle and the JSON API.
package server

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed static
var static embed.FS

// Handler serves the embedded web bundle at /.
func Handler() http.Handler {
	sub, err := fs.Sub(static, "static")
	if err != nil {
		panic(err) // static is embedded at build time; Sub only fails on a bad path literal
	}
	return http.FileServerFS(sub)
}
