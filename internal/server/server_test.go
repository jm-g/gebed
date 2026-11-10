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

	"gebed/internal/registry"
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
	return New(reg, run), dir
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
