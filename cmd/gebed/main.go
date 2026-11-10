// Command gebed serves the beads web UI.
package main

import (
	"errors"
	"flag"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/user"
	"path/filepath"

	"gebed/internal/peer"
	"gebed/internal/registry"
	"gebed/internal/server"
	"gebed/internal/store"
	"gebed/internal/theme"
)

func main() {
	addr := flag.String("addr", "127.0.0.1:7878", "listen address (loopback only by default)")
	claude := flag.String("claude", "", "Claude Code config dir (default ~/.claude)")
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
	u, err := user.Current()
	if err != nil {
		log.Fatal(err)
	}
	if *claude == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			log.Fatal(err)
		}
		*claude = filepath.Join(home, ".claude")
	}
	socks := filepath.Join(os.Getenv("XDG_RUNTIME_DIR"), "cc-socks")
	net := peer.Net{
		SessDir:  filepath.Join(*claude, "sessions"),
		ProcRoot: "/proc",
		FromSock: filepath.Join(socks, "gebed.sock"),
		FromName: "gebed",
	}
	// Sessions reply through bead comments; the endpoint only gives them a live address.
	switch ep, err := peer.Listen(net.FromSock, func(b []byte) { log.Printf("peer frame: %d bytes", len(b)) }); {
	case err == nil:
		defer func() { _ = ep.Close() }()
	case !errors.Is(err, peer.ErrInUse):
		log.Printf("peer endpoint: %v (messages to sessions still go out)", err)
	}
	log.Printf("gebed on http://%s", *addr)
	log.Fatal(http.ListenAndServe(*addr, server.New(reg, store.Exec, themes, net, u.Username)))
}
