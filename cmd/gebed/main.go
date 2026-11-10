// Command gebed serves the beads web UI.
package main

import (
	"flag"
	"log"
	"net/http"

	"gebed/internal/server"
)

func main() {
	addr := flag.String("addr", "127.0.0.1:7878", "listen address (loopback only by default)")
	flag.Parse()
	log.Printf("gebed on http://%s", *addr)
	log.Fatal(http.ListenAndServe(*addr, server.Handler()))
}
