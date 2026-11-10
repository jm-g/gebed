// Command gebed serves the beads web UI.
package main

import (
	"errors"
	"flag"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"gebed/internal/registry"
	"gebed/internal/server"
	"gebed/internal/store"
	"gebed/internal/theme"
)

func main() {
	addr := flag.String("addr", "127.0.0.1:7878", "listen address (loopback only by default)")
	flag.Parse()
	cfg, err := os.UserConfigDir()
	if err != nil {
		log.Fatal(err)
	}
	reg, err := registry.Load(filepath.Join(cfg, "gebed", "repos.json"))
	if err != nil {
		log.Fatal(err)
	}
	for _, dir := range flag.Args() { // repos given on the command line are registered
		if _, err := reg.Add(dir); err != nil {
			log.Fatal(err)
		}
	}
	themes := func() []theme.Scheme {
		all := theme.Builtin()
		user, errs := theme.LoadDir(os.DirFS(filepath.Join(cfg, "gebed")), "themes")
		for _, e := range errs {
			if !errors.Is(e, fs.ErrNotExist) {
				log.Printf("theme: %v", e)
			}
		}
		return append(all, user...)
	}
	log.Printf("gebed on http://%s", *addr)
	log.Fatal(http.ListenAndServe(*addr, server.New(reg, store.Exec, themes)))
}
