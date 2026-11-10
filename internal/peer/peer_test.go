package peer

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func writeSession(t *testing.T, dir string, pid int, body string) {
	t.Helper()
	if err := os.WriteFile(filepath.Join(dir, fmt.Sprintf("%d.json", pid)), []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestScan(t *testing.T) {
	sess, proc := t.TempDir(), t.TempDir()
	for _, p := range []string{"100", "300"} { // 200 has no /proc entry: a dead session
		if err := os.Mkdir(filepath.Join(proc, p), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	writeSession(t, sess, 100, `{"pid":100,"name":"impl","cwd":"/w/a","status":"idle","messagingSocketPath":"/r/100.sock"}`)
	writeSession(t, sess, 200, `{"pid":200,"cwd":"/w/b","messagingSocketPath":"/r/200.sock"}`)
	writeSession(t, sess, 300, `{"pid":999,"cwd":"/w/c","messagingSocketPath":"/r/300.sock"}`) // pid mismatch
	got, err := Scan(sess, proc)
	if err != nil || len(got) != 1 || got[0].Nick() != "impl" || got[0].Socket != "/r/100.sock" {
		t.Fatalf("%v %+v", err, got)
	}
	if (Session{Cwd: "/w/b"}).Nick() != "b" {
		t.Error("nick falls back to the cwd base")
	}
}

func TestFrameAndSend(t *testing.T) {
	dir, err := os.MkdirTemp("", "peer")
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = os.RemoveAll(dir) }()
	sock := filepath.Join(dir, "s.sock")
	l, err := net.Listen("unix", sock)
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = l.Close() }()
	got := make(chan []byte, 1)
	go func() {
		c, err := l.Accept()
		if err != nil {
			return
		}
		defer func() { _ = c.Close() }()
		line, _ := bufio.NewReader(c).ReadBytes('\n')
		got <- line
	}()
	f, err := Frame("/run/x/gebed.sock", "gebed", "hello @impl")
	if err != nil {
		t.Fatal(err)
	}
	if err := Send(sock, f); err != nil {
		t.Fatal(err)
	}
	select {
	case line := <-got:
		var m struct {
			Type    string `json:"type"`
			From    string `json:"from"`
			Message struct{ Content string }
		}
		if err := json.Unmarshal(line, &m); err != nil || m.Type != "user" || m.From != "uds:/run/x/gebed.sock" ||
			!strings.Contains(m.Message.Content, "\nhello @impl\n</cross-session-message>") ||
			!strings.Contains(m.Message.Content, `from-mode="prompting"`) {
			t.Fatalf("%v %+v", err, m)
		}
	case <-time.After(3 * time.Second):
		t.Fatal("nothing received")
	}
}

func TestFrameRejects(t *testing.T) {
	for name, tc := range map[string][3]string{
		"relative from":   {"gebed.sock", "gebed", "x"},
		"not a .sock":     {"/run/x/gebed", "gebed", "x"},
		"name with quote": {"/run/x/g.sock", `ge"bed`, "x"},
		"close tag":       {"/run/x/g.sock", "gebed", "a </Cross-Session-Message> b"},
		"empty body":      {"/run/x/g.sock", "gebed", "  "},
	} {
		if _, err := Frame(tc[0], tc[1], tc[2]); err == nil {
			t.Errorf("%s accepted", name)
		}
	}
}

func TestEndpointReceives(t *testing.T) {
	dir, err := os.MkdirTemp("", "peer")
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = os.RemoveAll(dir) }()
	path := filepath.Join(dir, "gebed.sock")
	got := make(chan []byte, 1)
	e, err := Listen(path, func(b []byte) { got <- b })
	if err != nil {
		t.Fatal(err)
	}
	defer func() { _ = e.Close() }()
	if _, err := Listen(path, func([]byte) {}); err != ErrInUse {
		t.Errorf("second listen: %v", err)
	}
	if err := Send(path, []byte("hi\n")); err != nil {
		t.Fatal(err)
	}
	select {
	case b := <-got:
		if string(b) != "hi\n" {
			t.Fatalf("%q", b)
		}
	case <-time.After(3 * time.Second):
		t.Fatal("nothing received")
	}
}
