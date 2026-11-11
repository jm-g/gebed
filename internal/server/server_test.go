package server

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"sync"
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
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"id":"x-1"`) || !strings.Contains(rec.Body.String(), `"labels":[]`) || !strings.Contains(rec.Body.String(), `"closedMs":null`) {
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

func TestEdgesAPI(t *testing.T) {
	list := `{"issues":[{"id":"x-1","title":"T","status":"open","priority":1,"issue_type":"task","dependency_count":1,"created_at":"2026-11-10T22:47:03Z","updated_at":"2026-11-10T22:47:03Z"}]}`
	edges := `[{"issue_id":"x-1","depends_on_id":"external:other:o-7","type":"blocks"}]`
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	dir := filepath.Join(t.TempDir(), "proj")
	if err := os.MkdirAll(filepath.Join(dir, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := reg.Add(dir); err != nil {
		t.Fatal(err)
	}
	h := New(reg, func(_ context.Context, _, _ string, args ...string) ([]byte, error) {
		if args[0] == "dep" {
			return []byte(edges), nil
		}
		return []byte(list), nil
	}, theme.Builtin, fakePeers{}, "vic")
	rec := get(h, "GET", "/api/repos/proj/edges", "")
	if rec.Code != 200 || !strings.Contains(rec.Body.String(), `"toRepo":"other","to":"o-7"`) {
		t.Fatalf("%d %s", rec.Code, rec.Body)
	}
}

func TestAddDepCrossRepo(t *testing.T) {
	var ran []string
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
	}, theme.Builtin, fakePeers{}, "vic")
	rec := get(h, "POST", "/api/repos/proj/ops", `{"op":"addDep","from":"x-1","on":"external:other:o-7","type":"related"}`)
	if rec.Code != 200 || ran[3] != "external:other:o-7" || ran[4] != "--type=related" {
		t.Fatalf("%d %q", rec.Code, ran)
	}
	for _, bad := range []string{"external:other", "--all"} {
		ran = nil
		if rec := get(h, "POST", "/api/repos/proj/ops", `{"op":"addDep","from":"x-1","on":"`+bad+`","type":"blocks"}`); rec.Code != 422 || ran != nil {
			t.Errorf("%s: %d %q", bad, rec.Code, ran)
		}
	}
}

func TestLinks(t *testing.T) {
	mkRepo := func(name string) string {
		d := filepath.Join(t.TempDir(), name)
		if err := os.MkdirAll(filepath.Join(d, ".beads"), 0o755); err != nil {
			t.Fatal(err)
		}
		return d
	}
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	da, db := mkRepo("alpha"), mkRepo("beta")
	for _, d := range []string{da, db} {
		if _, err := reg.Add(d); err != nil {
			t.Fatal(err)
		}
	}
	row := func(id, status string, deps int) string {
		return `{"id":"` + id + `","title":"T ` + id + `","status":"` + status + `","priority":1,"issue_type":"task","dependency_count":` + strconv.Itoa(deps) + `,"created_at":"2026-11-10T22:47:03Z","updated_at":"2026-11-10T22:47:03Z"}`
	}
	h := New(reg, func(_ context.Context, dir, _ string, args ...string) ([]byte, error) {
		switch {
		case args[0] == "dep" && filepath.Base(dir) == "alpha":
			return []byte(`[{"issue_id":"a-1","depends_on_id":"external:beta:b-1","type":"blocks"},{"issue_id":"a-1","depends_on_id":"external:gone:g-1","type":"related"},{"issue_id":"a-1","depends_on_id":"a-2","type":"blocks"}]`), nil
		case filepath.Base(dir) == "alpha":
			return []byte(`{"issues":[` + row("a-1", "open", 3) + `,` + row("a-2", "open", 0) + `]}`), nil
		}
		return []byte(`{"issues":[` + row("b-1", "closed", 0) + `]}`), nil
	}, theme.Builtin, fakePeers{}, "vic")
	rec := get(h, "GET", "/api/links", "")
	body := rec.Body.String()
	if rec.Code != 200 || strings.Count(body, `"type":`) != 2 { // the local a-1 -> a-2 edge is not a cross-repo link
		t.Fatalf("%d %s", rec.Code, body)
	}
	if !strings.Contains(body, `"to":{"repo":"beta","id":"b-1","title":"T b-1","status":"closed","found":true}`) {
		t.Errorf("resolved end missing: %s", body)
	}
	if !strings.Contains(body, `"to":{"repo":"gone","id":"g-1","title":"","status":"","found":false}`) {
		t.Errorf("dangling end missing: %s", body)
	}
}

// Every name in OpNames is a real op: parseOp must not call it unknown, and a
// name missing from OpNames would leave an op that MCP cannot reach.
func TestOpNamesMatchParseOp(t *testing.T) {
	for _, n := range OpNames {
		if n == "report" { // handled before parseOp, because it is several edits
			continue
		}
		if _, err := parseOp(opJSON{Op: n}, "vic"); err != nil && strings.Contains(err.Error(), "unknown op") {
			t.Errorf("%s is listed but unknown to parseOp", n)
		}
	}
	if _, err := parseOp(opJSON{Op: "nope"}, "vic"); err == nil || !strings.Contains(err.Error(), "unknown op") {
		t.Error("an unlisted op was not rejected as unknown")
	}
	src, err := os.ReadFile("ops.go")
	if err != nil {
		t.Fatal(err)
	}
	for _, line := range strings.Split(string(src), "\n") {
		if rest, ok := strings.CutPrefix(strings.TrimSpace(line), "case \""); ok {
			for _, n := range strings.Split(strings.ReplaceAll(rest, `"`, ""), ",") {
				name := strings.TrimSuffix(strings.TrimSpace(n), ":")
				if !slices.Contains(OpNames, name) {
					t.Errorf("parseOp handles %q but OpNames lacks it", name)
				}
			}
		}
	}
}

func TestSetScheduleOp(t *testing.T) {
	var ran []string
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
	}, theme.Builtin, fakePeers{}, "vic")
	rec := get(h, "POST", "/api/repos/proj/ops", `{"op":"setSchedule","id":"x-1","due":"2026-11-20","days":3}`)
	if rec.Code != 200 || ran[2] != "--due=2026-11-20" || ran[3] != "--estimate=4320" {
		t.Fatalf("%d %q", rec.Code, ran)
	}
	for _, body := range []string{
		`{"op":"setSchedule","id":"x-1","due":"tomorrow","days":3}`,
		`{"op":"setSchedule","id":"x-1","due":"2026-11-20","days":0}`,
		`{"op":"setSchedule","id":"--all","due":"2026-11-20","days":1}`,
	} {
		ran = nil
		if rec := get(h, "POST", "/api/repos/proj/ops", body); rec.Code != 422 || ran != nil {
			t.Errorf("%s: %d %q", body, rec.Code, ran)
		}
	}
}

// searchServer has an epic e-1 with one child c-1 (parent-child), a description
// and a comment only `show` and `comments` return.
func searchServer(t *testing.T) http.Handler {
	t.Helper()
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	dir := filepath.Join(t.TempDir(), "proj")
	if err := os.MkdirAll(filepath.Join(dir, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := reg.Add(dir); err != nil {
		t.Fatal(err)
	}
	row := func(id, title, kind string, deps int) string {
		return `{"id":"` + id + `","title":"` + title + `","status":"open","priority":1,"issue_type":"` + kind + `","dependency_count":` + strconv.Itoa(deps) + `,"created_at":"2026-10-02T10:00:00Z","updated_at":"2026-10-02T10:00:00Z","due_at":"2026-11-20T15:00:00Z"}`
	}
	return New(reg, func(_ context.Context, _, _ string, args ...string) ([]byte, error) {
		switch args[0] {
		case "list":
			return []byte(`{"issues":[` + row("e-1", "Auth epic", "epic", 0) + `,` + row("c-1", "Fix token refresh race", "task", 1) + `]}`), nil
		case "dep":
			return []byte(`[{"issue_id":"c-1","depends_on_id":"e-1","type":"parent-child"}]`), nil
		case "show":
			if args[1] == "c-1" {
				return []byte(`[` + strings.TrimSuffix(row("c-1", "Fix token refresh race", "task", 1), "}") + `,"description":"Sessions expire during a refresh"}]`), nil
			}
			return []byte(`[` + row("e-1", "Auth epic", "epic", 0) + `]`), nil
		case "comments":
			if args[1] == "c-1" {
				return []byte(`[{"id":1,"issue_id":"c-1","author":"ana","text":"the needle is in the cache","created_at":"2026-11-02T10:00:00Z"}]`), nil
			}
			return []byte(`[]`), nil
		}
		return []byte(`{}`), nil
	}, theme.Builtin, fakePeers{}, "vic")
}

func TestEpicsAreTagsOnTheirChildren(t *testing.T) {
	rec := get(searchServer(t), "GET", "/api/repos/proj/beads", "")
	if !strings.Contains(rec.Body.String(), `"epics":[{"id":"e-1","title":"Auth epic"}]`) {
		t.Fatalf("child has no epic tag: %s", rec.Body)
	}
	if strings.Count(rec.Body.String(), `"epics":[]`) != 1 { // the epic itself has none
		t.Errorf("epic carries an epic tag: %s", rec.Body)
	}
}

func TestSearchAPI(t *testing.T) {
	h := searchServer(t)
	hitIDs := func(path string) string {
		rec := get(h, "GET", path, "")
		if rec.Code != 200 {
			t.Fatalf("%s: %d %s", path, rec.Code, rec.Body)
		}
		return rec.Body.String()
	}
	for name, tc := range map[string]struct{ path, field string }{
		"comment text":          {"/api/search?mode=exact&q=needle", `"field":"comment"`},
		"description text":      {"/api/search?mode=exact&q=expire", `"field":"description"`},
		"date":                  {"/api/search?mode=exact&q=2026-11-20", `"field":"due"`},
		"epic name":             {"/api/search?mode=exact&q=auth", `"id":"c-1"`},
		"fuzzy title":           {"/api/search?mode=fuzzy&q=tknrfsh", `"id":"c-1"`},
		"fuzzy finds a comment": {"/api/search?mode=fuzzy&q=ndlcache", `"field":"comment"`},
	} {
		if body := hitIDs(tc.path); !strings.Contains(body, tc.field) {
			t.Errorf("%s: %s", name, body)
		}
	}
	// exact is not fuzzy
	if body := hitIDs("/api/search?mode=exact&q=tknrfsh"); strings.Contains(body, `"id":"c-1"`) {
		t.Errorf("exact search matched fuzzily: %s", body)
	}
	if rec := get(h, "GET", "/api/search?mode=bogus&q=x", ""); rec.Code != 400 {
		t.Errorf("bad mode: %d", rec.Code)
	}
}

func TestSetScheduleMinutes(t *testing.T) {
	var ran []string
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
	}, theme.Builtin, fakePeers{}, "vic")
	rec := get(h, "POST", "/api/repos/proj/ops", `{"op":"setSchedule","id":"x-1","due":"2026-11-20T14:30:00Z","minutes":20}`)
	if rec.Code != 200 || ran[2] != "--due=2026-11-20T14:30:00Z" || ran[3] != "--estimate=20" {
		t.Fatalf("%d %q", rec.Code, ran)
	}
	for name, body := range map[string]string{
		"both days and minutes": `{"op":"setSchedule","id":"x-1","due":"2026-11-20","days":1,"minutes":5}`,
		"neither":               `{"op":"setSchedule","id":"x-1","due":"2026-11-20"}`,
		"space time":            `{"op":"setSchedule","id":"x-1","due":"2026-11-20 14:30","minutes":5}`,
	} {
		ran = nil
		if rec := get(h, "POST", "/api/repos/proj/ops", body); rec.Code != 422 || ran != nil {
			t.Errorf("%s: %d %q", name, rec.Code, ran)
		}
	}
}

// reportServer's bead has a planner weight, an old outcome label and an old
// complexity; every CLI call is recorded.
func reportServer(t *testing.T, calls *[][]string) http.Handler {
	t.Helper()
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	dir := filepath.Join(t.TempDir(), "proj")
	if err := os.MkdirAll(filepath.Join(dir, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := reg.Add(dir); err != nil {
		t.Fatal(err)
	}
	show := `[{"id":"x-1","title":"T","status":"open","priority":1,"issue_type":"task","labels":["weight:5","outcome:failure","complexity:2","ui"],"created_at":"2026-11-01T10:00:00Z","updated_at":"2026-11-01T10:00:00Z"}]`
	return New(reg, func(_ context.Context, _, _ string, args ...string) ([]byte, error) {
		*calls = append(*calls, args)
		if args[0] == "show" {
			return []byte(show), nil
		}
		return []byte(`{}`), nil
	}, theme.Builtin, fakePeers{}, "vic")
}

func TestReportWritesLabelsAndTheReportComment(t *testing.T) {
	var calls [][]string
	h := reportServer(t, &calls)
	body := `{"op":"report","id":"x-1","agent":"impl","outcome":"success","weight":13,"complexity":4,"minutes":42,"attempts":2,"findings":"found a race"}`
	rec := get(h, "POST", "/api/repos/proj/ops", body)
	if rec.Code != 200 {
		t.Fatalf("%d %s", rec.Code, rec.Body)
	}
	var did []string
	for _, c := range calls {
		did = append(did, strings.Join(c[:min(len(c), 4)], " "))
	}
	all := strings.Join(did, "\n")
	for _, want := range []string{
		"label remove x-1 outcome:failure", // the old outcome goes
		"label remove x-1 complexity:2",    // so does the old complexity, because a new one is reported
		"label add x-1 outcome:success",
		"label add x-1 complexity:4",
		"comments add x-1 --author=impl",
	} {
		if !strings.Contains(all, want) {
			t.Errorf("missing %q in:\n%s", want, all)
		}
	}
	if strings.Contains(all, "weight:13") || strings.Contains(all, "weight:5") {
		t.Errorf("the planner's weight must be left alone:\n%s", all)
	}
	last := calls[len(calls)-1]
	if text := last[len(last)-1]; !strings.HasPrefix(text, `report: {"agent":"impl","outcome":"success"`) || !strings.Contains(text, "\nfound a race") {
		t.Errorf("comment text %q", text)
	}
}

func TestInvalidReportsChangeNothing(t *testing.T) {
	for name, body := range map[string]string{
		"no outcome":   `{"op":"report","id":"x-1"}`,
		"weight 500":   `{"op":"report","id":"x-1","outcome":"success","weight":500}`,
		"bad outcome":  `{"op":"report","id":"x-1","outcome":"great"}`,
		"flag-like id": `{"op":"report","id":"--all","outcome":"success"}`,
	} {
		var calls [][]string
		h := reportServer(t, &calls)
		if rec := get(h, "POST", "/api/repos/proj/ops", body); rec.Code != 422 || len(calls) != 0 {
			t.Errorf("%s: %d, ran %q", name, rec.Code, calls)
		}
	}
}

func TestMetricsEndpointReadsReportsFromComments(t *testing.T) {
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	dir := filepath.Join(t.TempDir(), "proj")
	if err := os.MkdirAll(filepath.Join(dir, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := reg.Add(dir); err != nil {
		t.Fatal(err)
	}
	h := New(reg, func(_ context.Context, _, _ string, args ...string) ([]byte, error) {
		switch args[0] {
		case "list":
			return []byte(`{"issues":[{"id":"x-1","title":"T","status":"closed","priority":1,"issue_type":"task","labels":["weight:5"],"estimated_minutes":60,"created_at":"2026-11-01T10:00:00Z","updated_at":"2026-11-10T10:00:00Z","closed_at":"2026-11-10T10:00:00Z"}]}`), nil
		case "comments":
			return []byte(`[{"id":1,"issue_id":"x-1","author":"impl","text":"report: {\"agent\":\"impl\",\"outcome\":\"success\",\"minutes\":90,\"attempts\":2,\"capacity\":3}\nfound a race","created_at":"2026-11-10T09:00:00Z"},{"id":2,"issue_id":"x-1","author":"vic","text":"report: {nope","created_at":"2026-11-10T09:30:00Z"}]`), nil
		case "show":
			return []byte(`[{"id":"x-1","title":"T","status":"closed","priority":1,"issue_type":"task","created_at":"2026-11-01T10:00:00Z","updated_at":"2026-11-10T10:00:00Z"}]`), nil
		}
		return []byte(`[]`), nil
	}, theme.Builtin, fakePeers{}, "vic")
	rec := get(h, "GET", "/api/repos/proj/metrics", "")
	body := rec.Body.String()
	for _, want := range []string{`"reports":1`, `"successRate":100`, `"pointsDone":5`, `"capacity":3`, `"reworkRate":100`, `"estimateBias":50`, `"minutesPerPoint":18`} {
		if rec.Code != 200 || !strings.Contains(body, want) {
			t.Fatalf("missing %s in %d %s", want, rec.Code, body)
		}
	}
}

// Warm reads the beads, the long text and the comments of every repo without a
// request, so the first search or metrics view is not slow.
func TestWarmBuildsSearchDocsOfEveryRepo(t *testing.T) {
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	for _, n := range []string{"one", "two"} {
		d := filepath.Join(t.TempDir(), n)
		if err := os.MkdirAll(filepath.Join(d, ".beads"), 0o755); err != nil {
			t.Fatal(err)
		}
		if _, err := reg.Add(d); err != nil {
			t.Fatal(err)
		}
	}
	var mu sync.Mutex
	asked := map[string]bool{}
	srv := New(reg, func(_ context.Context, dir, _ string, args ...string) ([]byte, error) {
		mu.Lock()
		defer mu.Unlock()
		if args[0] == "comments" {
			asked[filepath.Base(dir)] = true
		}
		switch args[0] {
		case "list":
			return []byte(`{"issues":[{"id":"x-1","title":"T","status":"open","priority":1,"issue_type":"task","created_at":"2026-11-10T22:47:03Z","updated_at":"2026-11-10T22:47:03Z"}]}`), nil
		case "show":
			return []byte(`[{"id":"x-1","title":"T","status":"open","priority":1,"issue_type":"task","created_at":"2026-11-10T22:47:03Z","updated_at":"2026-11-10T22:47:03Z"}]`), nil
		}
		return []byte(`[]`), nil
	}, theme.Builtin, fakePeers{}, "vic")
	srv.Warm()
	deadline := time.Now().Add(3 * time.Second)
	for {
		mu.Lock()
		n := len(asked)
		mu.Unlock()
		if n == 2 {
			return
		}
		if time.Now().After(deadline) {
			t.Fatalf("only %v were warmed", asked)
		}
		time.Sleep(10 * time.Millisecond)
	}
}

// After an edit only the beads that changed are read again. The change here is
// only a new comment, which bd does not show in the update time but does in the
// comment count.
func TestEditRereadsOnlyTheChangedBead(t *testing.T) {
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	dir := filepath.Join(t.TempDir(), "proj")
	if err := os.MkdirAll(filepath.Join(dir, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	repo, err := reg.Add(dir)
	if err != nil {
		t.Fatal(err)
	}
	var mu sync.Mutex
	comments := 0 // the number of comments on x-2
	reads := map[string]int{}
	srv := New(reg, func(_ context.Context, _, _ string, args ...string) ([]byte, error) {
		mu.Lock()
		defer mu.Unlock()
		row := func(id string, n int) string {
			return `{"id":"` + id + `","title":"T","status":"open","priority":1,"issue_type":"task","comment_count":` + strconv.Itoa(n) + `,"created_at":"2026-11-10T22:47:03Z","updated_at":"2026-11-10T22:47:03Z"}`
		}
		switch args[0] {
		case "list":
			return []byte(`{"issues":[` + row("x-1", 0) + `,` + row("x-2", comments) + `]}`), nil
		case "show":
			reads[args[1]]++
			return []byte(`[` + row(args[1], 0) + `]`), nil
		}
		return []byte(`[]`), nil
	}, theme.Builtin, fakePeers{}, "vic")

	if _, err := srv.a.searchDocs(context.Background(), repo); err != nil {
		t.Fatal(err)
	}
	mu.Lock()
	comments = 1
	mu.Unlock()
	if err := os.WriteFile(filepath.Join(dir, ".beads", "issues.jsonl"), []byte("changed"), 0o644); err != nil { // the store changed
		t.Fatal(err)
	}
	if _, err := srv.a.searchDocs(context.Background(), repo); err != nil {
		t.Fatal(err)
	}
	mu.Lock()
	defer mu.Unlock()
	if reads["x-1"] != 1 || reads["x-2"] != 2 {
		t.Fatalf("x-1 read %d times (want 1), x-2 read %d times (want 2)", reads["x-1"], reads["x-2"])
	}
}
