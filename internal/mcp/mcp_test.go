package mcp

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http/httptest"
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"gebed/internal/peer"
	"gebed/internal/registry"
	"gebed/internal/server"
	"gebed/internal/theme"
)

type noPeers struct{}

func (noPeers) List() ([]peer.Session, error) {
	return []peer.Session{{PID: 1, Name: "impl", Cwd: "/w", Status: "idle", Socket: "/r/1.sock"}}, nil
}
func (noPeers) Send(peer.Session, string) error { return nil }

// backend starts the real gebed handler over a fake br; it returns the mcp
// server pointed at it and the argv of the last CLI call.
func backend(t *testing.T) (*Server, *[]string) {
	t.Helper()
	reg, _ := registry.Load(filepath.Join(t.TempDir(), "repos.json"))
	dir := filepath.Join(t.TempDir(), "proj")
	if err := os.MkdirAll(filepath.Join(dir, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	if _, err := reg.Add(dir); err != nil {
		t.Fatal(err)
	}
	var last []string
	h := server.New(reg, func(_ context.Context, _, _ string, args ...string) ([]byte, error) {
		last = args
		if args[0] == "list" {
			return []byte(`{"issues":[{"id":"p-1","title":"T","status":"open","priority":1,"issue_type":"task","created_at":"2026-11-10T22:47:03Z","updated_at":"2026-11-10T22:47:03Z"}]}`), nil
		}
		return []byte(`{"id":"p-1"}`), nil
	}, theme.Builtin, noPeers{}, "vic")
	ts := httptest.NewServer(h)
	t.Cleanup(ts.Close)
	return &Server{Base: ts.URL}, &last
}

// rpc sends lines and returns one decoded reply per request that has an id.
func rpc(t *testing.T, s *Server, lines ...string) []map[string]any {
	t.Helper()
	var out bytes.Buffer
	if err := s.Serve(context.Background(), strings.NewReader(strings.Join(lines, "\n")+"\n"), &out); err != nil {
		t.Fatal(err)
	}
	var rs []map[string]any
	dec := json.NewDecoder(&out)
	for dec.More() {
		var m map[string]any
		if err := dec.Decode(&m); err != nil {
			t.Fatal(err)
		}
		rs = append(rs, m)
	}
	return rs
}

func text(r map[string]any) (string, bool) {
	res := r["result"].(map[string]any)
	c := res["content"].([]any)[0].(map[string]any)["text"].(string)
	e, _ := res["isError"].(bool)
	return c, e
}

func TestHandshakeAndList(t *testing.T) {
	s, _ := backend(t)
	rs := rpc(t, s,
		`{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}`,
		`{"jsonrpc":"2.0","method":"notifications/initialized"}`,
		`{"jsonrpc":"2.0","id":2,"method":"tools/list"}`,
		`{"jsonrpc":"2.0","id":3,"method":"nope"}`,
	)
	if len(rs) != 3 { // the notification gets no reply
		t.Fatalf("got %d replies: %v", len(rs), rs)
	}
	if rs[0]["result"].(map[string]any)["serverInfo"].(map[string]any)["name"] != "gebed" {
		t.Errorf("initialize: %v", rs[0])
	}
	if n := len(rs[1]["result"].(map[string]any)["tools"].([]any)); n != len(tools) {
		t.Errorf("tools/list: %d of %d", n, len(tools))
	}
	if rs[2]["error"].(map[string]any)["code"].(float64) != -32601 {
		t.Errorf("unknown method: %v", rs[2])
	}
}

func TestReadTool(t *testing.T) {
	s, _ := backend(t)
	rs := rpc(t, s, `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gebed_list_beads","arguments":{"repo":"proj"}}}`)
	txt, isErr := text(rs[0])
	if isErr || !strings.Contains(txt, `"id":"p-1"`) {
		t.Fatalf("%v %s", isErr, txt)
	}
}

func TestWriteToolReachesTheCLI(t *testing.T) {
	s, last := backend(t)
	rs := rpc(t, s, `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gebed_set_status","arguments":{"repo":"proj","id":"p-1","status":"in_progress"}}}`)
	if txt, isErr := text(rs[0]); isErr {
		t.Fatal(txt)
	}
	if !slices.Equal(*last, []string{"update", "p-1", "--status=in_progress", "--json"}) {
		t.Fatalf("ran %q", *last)
	}
}

func TestCommentReportsDelivery(t *testing.T) {
	s, _ := backend(t)
	rs := rpc(t, s, `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gebed_comment","arguments":{"repo":"proj","id":"p-1","text":"@impl ping @ghost"}}}`)
	txt, isErr := text(rs[0])
	if isErr || !strings.Contains(txt, `"name":"impl","delivered":true`) || !strings.Contains(txt, `"name":"ghost","delivered":false`) {
		t.Fatalf("%v %s", isErr, txt)
	}
}

// A server refusal and a bad call are tool errors the agent can read, not protocol failures.
func TestErrorsAreToolResults(t *testing.T) {
	s, last := backend(t)
	for name, line := range map[string]string{
		"server 422":       `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gebed_set_priority","arguments":{"repo":"proj","id":"p-1","priority":9}}}`,
		"missing argument": `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gebed_get_bead","arguments":{"repo":"proj"}}}`,
		"wrong type":       `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gebed_set_priority","arguments":{"repo":"proj","id":"p-1","priority":"high"}}}`,
		"flag-like id":     `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gebed_close","arguments":{"repo":"proj","id":"--all"}}}`,
	} {
		*last = nil
		txt, isErr := text(rpc(t, s, line)[0])
		if !isErr || txt == "" || *last != nil {
			t.Errorf("%s: isError=%v ran=%q %s", name, isErr, *last, txt)
		}
	}
	if r := rpc(t, s, `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"nope","arguments":{}}}`)[0]; r["error"] == nil {
		t.Error("unknown tool was not an error")
	}
}

func TestServerDown(t *testing.T) {
	s := &Server{Base: "http://127.0.0.1:1"}
	txt, isErr := text(rpc(t, s, `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"gebed_list_repos"}}`)[0])
	if !isErr || !strings.Contains(txt, "Start it with `gebed`") {
		t.Fatalf("%v %s", isErr, txt)
	}
}

// The MCP server must do everything the web UI does: every server op has a
// tool, every read the UI makes has a tool, and no tool posts an op that the
// server does not know.
func TestToolsCoverTheWebUI(t *testing.T) {
	var posted []string
	for _, tl := range tools {
		if n := opOf(tl); n != "" {
			posted = append(posted, n)
		}
	}
	for _, n := range server.OpNames {
		if !slices.Contains(posted, n) {
			t.Errorf("op %s has no MCP tool", n)
		}
	}
	for _, n := range posted {
		if !slices.Contains(server.OpNames, n) {
			t.Errorf("a tool posts unknown op %s", n)
		}
	}
	paths := map[string]bool{}
	for _, tl := range tools {
		if c := tl.build(sample(tl)); c.method == "GET" {
			paths[c.path] = true
		}
	}
	for _, want := range []string{"/api/repos", "/api/links", "/api/sessions", "/api/themes",
		"/api/repos/x/beads", "/api/repos/x/beads/x", "/api/repos/x/beads/x/comments", "/api/repos/x/edges"} {
		if !paths[want] {
			t.Errorf("no tool reads %s", want)
		}
	}
	if !func() bool {
		for _, tl := range tools {
			if tl.name == "gebed_add_repo" {
				return true
			}
		}
		return false
	}() {
		t.Error("no tool registers a repo")
	}
}
