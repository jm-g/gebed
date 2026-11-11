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
	if _, err := r.Add(beadsDir(t, "same")); err != nil {
		t.Fatal(err)
	}
	if _, err := r.Add(beadsDir(t, "same")); err == nil {
		t.Error("duplicate name from other dir accepted")
	}
}

func TestAddExpandsHome(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	if err := os.MkdirAll(filepath.Join(home, "proj", ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	r, _ := Load(filepath.Join(t.TempDir(), "repos.json"))
	got, err := r.Add("~/proj")
	if err != nil || got.Dir != filepath.Join(home, "proj") {
		t.Fatalf("~/proj: %+v %v", got, err)
	}
	if _, err := r.Add("~nobody/proj"); err == nil {
		t.Error("~user accepted as a path")
	}
}

func TestParseLine(t *testing.T) {
	for line, want := range map[string][2]string{
		"foo:/x/vic":      {"foo", "/x/vic"},
		"/x/vic":          {"", "/x/vic"},
		"/x:y/vic":        {"", "/x:y/vic"},
		"~/p/vic":         {"", "~/p/vic"},
		" foo : ~/p/vic ": {"foo", "~/p/vic"},
		"foo:":            {"foo", ""},
	} {
		if n, d := ParseLine(line); n != want[0] || d != want[1] {
			t.Errorf("%q: got (%q, %q), want %q", line, n, d, want)
		}
	}
}

func TestAddNamedSameBaseName(t *testing.T) {
	r, _ := Load(filepath.Join(t.TempDir(), "repos.json"))
	a, b := beadsDir(t, "vic"), beadsDir(t, "vic")
	if _, err := r.AddNamed("one", a); err != nil {
		t.Fatal(err)
	}
	if got, err := r.AddNamed("two", b); err != nil || got.Name != "two" {
		t.Fatalf("second vic: %+v %v", got, err)
	}
	if _, err := r.Add(""); err == nil {
		t.Error("empty path accepted")
	}
}

func TestRemovePersists(t *testing.T) {
	p := filepath.Join(t.TempDir(), "repos.json")
	r, _ := Load(p)
	if _, err := r.Add(beadsDir(t, "alpha")); err != nil {
		t.Fatal(err)
	}
	if _, err := r.Remove("alpha"); err != nil {
		t.Fatal(err)
	}
	if _, err := r.Remove("alpha"); err == nil {
		t.Error("second remove accepted")
	}
	r2, _ := Load(p)
	if len(r2.List()) != 0 {
		t.Errorf("removed repo came back after reload: %v", r2.List())
	}
}
