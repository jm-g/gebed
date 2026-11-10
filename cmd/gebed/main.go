// Command gebed serves the beads web UI.
package main

import (
	"flag"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"gebed/internal/registry"
	"gebed/internal/server"
	"gebed/internal/store"
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
	log.Printf("gebed on http://%s", *addr)
	log.Fatal(http.ListenAndServe(*addr, server.New(reg, store.Exec)))
}
