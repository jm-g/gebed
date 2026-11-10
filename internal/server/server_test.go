package server

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"gebed/internal/peer"
	"gebed/internal/registry"
	"gebed/internal/theme"
)

func newServer(t *testing.T, out string) (http.Handler, string) {
	t.Helper()
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	dir := filepath.Join(t.TempDir(), "proj")
	if err := os.MkdirAll(filepath.Join(dir, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := reg.Add(dir); err != nil {
		t.Fatal(err)
	}
	run := func(_ context.Context, _, bin string, args ...string) ([]byte, error) {
		if out == "" {
			return nil, errors.New("boom")
		}
		return []byte(out), nil
	}
	return New(reg, run, theme.Builtin, fakePeers{}, "vic"), dir
}

func get(h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, path, strings.NewReader(body)))
	return rec
}

func TestServesIndex(t *testing.T) {
	h, _ := newServer(t, "")
	if rec := get(h, "GET", "/", ""); rec.Code != 200 || !strings.Contains(rec.Body.String(), "gebed") {
		t.Fatalf("got %d %q", rec.Code, rec.Body.String())
	}
}

const brList = `{"issues":[{"id":"x-1","title":"T","status":"open","priority":1,"issue_type":"task","created_at":"2026-11-10T22:47:03Z","updated_at":"2026-11-10T22:47:03Z"}]}`

func TestAPI(t *testing.T) {
	h, _ := newServer(t, brList)
	if rec := get(h, "GET", "/api/repos", ""); !strings.Contains(rec.Body.String(), `"backend":"br"`) {
		t.Errorf("repos: %s", rec.Body)
	}
	rec := get(h, "GET", "/api/repos/proj/beads", "")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"id":"x-1"`) || !strings.Contains(rec.Body.String(), `"labels":[]`) {
		t.Errorf("beads: %d %s", rec.Code, rec.Body)
	}
	if rec := get(h, "GET", "/api/repos/nope/beads", ""); rec.Code != 404 {
		t.Errorf("unknown repo: %d", rec.Code)
	}
	if rec := get(h, "POST", "/api/repos", `{"dir":"/definitely/not/here"}`); rec.Code != 422 {
		t.Errorf("bad dir: %d", rec.Code)
	}
}

func TestBackendFailureIs502(t *testing.T) {
	h, _ := newServer(t, "")
	if rec := get(h, "GET", "/api/repos/proj/beads", ""); rec.Code != 502 {
		t.Errorf("got %d", rec.Code)
	}
}

func TestThemes(t *testing.T) {
	h, _ := newServer(t, "")
	rec := get(h, "GET", "/api/themes", "")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"base0D":"#89b4fa"`) {
		t.Errorf("%d %s", rec.Code, rec.Body)
	}
}

func TestOps(t *testing.T) {
	var got []string
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	dir := filepath.Join(t.TempDir(), "proj")
	if err := os.MkdirAll(filepath.Join(dir, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := reg.Add(dir); err != nil {
		t.Fatal(err)
	}
	h := New(reg, func(_ context.Context, _, _ string, args ...string) ([]byte, error) {
		got = args
		return []byte(`{"id":"proj-9"}`), nil
	}, theme.Builtin, fakePeers{}, "vic")

	rec := get(h, "POST", "/api/repos/proj/ops", `{"op":"create","title":"-evil","kind":"task","priority":1}`)
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"id":"proj-9"`) || got[1] != "--title=-evil" {
		t.Fatalf("create: %d %s %q", rec.Code, rec.Body, got)
	}
	for name, body := range map[string]string{
		"flag-like id":    `{"op":"close","id":"--all"}`,
		"bad priority":    `{"op":"setPriority","id":"x","priority":9}`,
		"unknown op":      `{"op":"drop"}`,
		"multiline title": `{"op":"create","title":"a\nb","kind":"task"}`,
		"comma label":     `{"op":"addLabel","id":"x","label":"a,b"}`,
	} {
		got = nil
		if rec := get(h, "POST", "/api/repos/proj/ops", body); rec.Code != 422 || got != nil {
			t.Errorf("%s: code %d, ran %q", name, rec.Code, got)
		}
	}
	if rec := get(h, "POST", "/api/repos/proj/ops", `{"op":"reopen","id":"x","bogus":1}`); rec.Code != 400 {
		t.Errorf("unknown field: %d", rec.Code)
	}
}

// fakePeers has one live session, "impl", and records what is sent to it.
type fakePeers struct{ sent *[]string }

func (fakePeers) List() ([]peer.Session, error) {
	return []peer.Session{{PID: 1, Name: "impl", Cwd: "/w/impl", Status: "idle", Socket: "/r/1.sock"}}, nil
}

func (f fakePeers) Send(_ peer.Session, body string) error {
	if f.sent != nil {
		*f.sent = append(*f.sent, body)
	}
	return nil
}

func TestCommentNotifiesMentions(t *testing.T) {
	var sent, ran []string
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	dir := filepath.Join(t.TempDir(), "proj")
	if err := os.MkdirAll(filepath.Join(dir, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := reg.Add(dir); err != nil {
		t.Fatal(err)
	}
	h := New(reg, func(_ context.Context, _, _ string, args ...string) ([]byte, error) {
		ran = args
		return []byte(`{}`), nil
	}, theme.Builtin, fakePeers{&sent}, "vic")
	rec := get(h, "POST", "/api/repos/proj/ops", `{"op":"addComment","id":"proj-1","text":"@impl status? cc @ghost"}`)
	body := rec.Body.String()
	if rec.Code != 200 || !strings.Contains(body, `"name":"impl","delivered":true`) ||
		!strings.Contains(body, `"name":"ghost","delivered":false`) {
		t.Fatalf("%d %s", rec.Code, body)
	}
	if len(sent) != 1 || !strings.Contains(sent[0], "status?") || !strings.Contains(sent[0], "br comments add proj-1") {
		t.Fatalf("sent %q", sent)
	}
	if ran[0] != "comments" || ran[3] != "--author=vic" {
		t.Fatalf("ran %q", ran)
	}
	if rec := get(h, "POST", "/api/repos/proj/ops", `{"op":"addComment","id":"proj-1","text":"  "}`); rec.Code != 422 {
		t.Errorf("blank comment: %d", rec.Code)
	}
}

func TestSessions(t *testing.T) {
	h, _ := newServer(t, "")
	if rec := get(h, "GET", "/api/sessions", ""); !strings.Contains(rec.Body.String(), `"nick":"impl"`) {
		t.Errorf("%s", rec.Body)
	}
}

func TestFingerprint(t *testing.T) {
	d := t.TempDir()
	b := filepath.Join(d, ".beads")
	if err := os.MkdirAll(filepath.Join(b, "embeddeddolt", ".dolt"), 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(p, s string) {
		if err := os.WriteFile(filepath.Join(b, p), []byte(s), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("issues.jsonl", "a")
	write("embeddeddolt/.dolt/journal", "12345")
	v0 := fingerprint(d)
	write("last-touched", "x") // quiet: reads touch it
	write("beads.db-wal", "x")
	if fingerprint(d) != v0 {
		t.Error("quiet files changed the fingerprint")
	}
	later := time.Now().Add(time.Hour)
	if err := os.Chtimes(filepath.Join(b, "embeddeddolt/.dolt/journal"), later, later); err != nil {
		t.Fatal(err)
	}
	if fingerprint(d) != v0 {
		t.Error("dolt mtime changed the fingerprint")
	}
	write("embeddeddolt/.dolt/journal", "123456") // a write grows the journal
	if fingerprint(d) == v0 {
		t.Error("dolt growth not seen")
	}
	v1 := fingerprint(d)
	write("issues.jsonl", "b")
	if fingerprint(d) == v1 {
		t.Error("jsonl change not seen")
	}
}
