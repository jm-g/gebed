package server

import (
	"fmt"
	"hash/fnv"
	"io/fs"
	"net/http"
	"path/filepath"
	"strings"
)

// quiet names files that br and bd touch even on reads (lock, wal, caches); they
// must not count as a change or the UI would refetch in a loop.
func quiet(name string) bool {
	for _, s := range []string{"-shm", "-wal", ".lock", "-gate", "-use", "-cert", "-cert-head", "-migration-state"} {
		if strings.HasSuffix(name, s) {
			return true
		}
	}
	return name == "last-touched" || strings.Contains(name, "-wal-") || strings.Contains(name, "-fsqlite-")
}

// fingerprint hashes the path, size and mtime of the store files under dir/.beads.
func fingerprint(dir string) string {
	h := fnv.New64a()
	_ = filepath.WalkDir(filepath.Join(dir, ".beads"), func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() || quiet(d.Name()) {
			return nil // a file that vanishes mid-walk is a change the next poll sees
		}
		fi, err := d.Info()
		if err != nil {
			return nil
		}
		if strings.Contains(p, "/.dolt/") {
			// dolt rewrites its files on reads; its journal only grows on writes, so size alone shows a change
			_, _ = fmt.Fprintf(h, "%s %d\n", p, fi.Size()) // a hash write never fails
			return nil
		}
		_, _ = fmt.Fprintf(h, "%s %d %d\n", p, fi.Size(), fi.ModTime().UnixNano())
		return nil
	})
	return fmt.Sprintf("%x", h.Sum64())
}

func (a *api) version(w http.ResponseWriter, r *http.Request) {
	repo, ok := a.reg.Find(r.PathValue("name"))
	if !ok {
		fail(w, http.StatusNotFound, fmt.Errorf("unknown repo"))
		return
	}
	reply(w, http.StatusOK, map[string]string{"v": fingerprint(repo.Dir)})
}
