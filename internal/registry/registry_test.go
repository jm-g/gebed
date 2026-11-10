package registry

import (
	"os"
	"path/filepath"
	"testing"
)

func beadsDir(t *testing.T, name string) string {
	t.Helper()
	d := filepath.Join(t.TempDir(), name)
	if err := os.MkdirAll(filepath.Join(d, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	return d
}

func TestAddPersistsAndReloads(t *testing.T) {
	p := filepath.Join(t.TempDir(), "repos.json")
	r, _ := Load(p)
	a := beadsDir(t, "alpha")
	if _, err := r.Add(a); err != nil {
		t.Fatal(err)
	}
	if _, err := r.Add(a); err != nil { // same dir again: no-op
		t.Fatal(err)
	}
	r2, err := Load(p)
	if err != nil || len(r2.List()) != 1 || r2.List()[0].Name != "alpha" {
		t.Fatalf("reload: %v %v", r2.List(), err)
	}
}

func TestAddRejects(t *testing.T) {
	r, _ := Load(filepath.Join(t.TempDir(), "repos.json"))
	if _, err := r.Add(t.TempDir()); err == nil {
		t.Error("dir without .beads accepted")
	}
	r.Add(beadsDir(t, "same"))
	if _, err := r.Add(beadsDir(t, "same")); err == nil {
		t.Error("duplicate name from other dir accepted")
	}
}
