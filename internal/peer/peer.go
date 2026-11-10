// Package peer talks to local Claude Code sessions over their unix sockets.
//
// Protocol measured in ~/hk/ircc (internal/registry/entry.go, internal/peer/frame.go,
// conn.go): a live session writes ~/.claude/sessions/<pid>.json with its
// messagingSocketPath; a message is one JSON line written to that socket, with
// the text wrapped in a <cross-session-message> element.
package peer

import (
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
)

const (
	sendTimeout = 5 * time.Second
	maxEntry    = 64 << 10
	maxFrame    = 1 << 20
	closeTag    = "</cross-session-message>"
)

// Session is one live Claude Code session.
type Session struct {
	PID    int    `json:"pid"`
	Name   string `json:"name"`
	Cwd    string `json:"cwd"`
	Status string `json:"status"`
	Socket string `json:"-"`
}

type entry struct {
	PID    int    `json:"pid"`
	Name   string `json:"name"`
	Cwd    string `json:"cwd"`
	Status string `json:"status"`
	Socket string `json:"messagingSocketPath"`
}

// Nick is the name others use to mention the session: its /rename name, else
// the base of its working directory.
func (s Session) Nick() string {
	if s.Name != "" {
		return s.Name
	}
	return filepath.Base(s.Cwd)
}

// Scan lists the live sessions registered in sessDir (~/.claude/sessions).
// Only <pid>.json regular files are read; a session whose pid is gone under
// procRoot is skipped. The result is sorted by pid.
func Scan(sessDir, procRoot string) ([]Session, error) {
	des, err := os.ReadDir(sessDir)
	if err != nil {
		return nil, err
	}
	var out []Session
	for _, de := range des {
		n := de.Name()
		if !regexp.MustCompile(`^\d+\.json$`).MatchString(n) || !de.Type().IsRegular() {
			continue
		}
		f, err := os.Open(filepath.Join(sessDir, n))
		if err != nil {
			continue
		}
		var e entry
		err = json.NewDecoder(&limited{f, maxEntry}).Decode(&e)
		_ = f.Close()
		if err != nil || e.PID <= 0 || n != strconv.Itoa(e.PID)+".json" || e.Socket == "" {
			continue
		}
		if _, err := os.Stat(filepath.Join(procRoot, strconv.Itoa(e.PID))); err != nil {
			continue
		}
		out = append(out, Session(e))
	}
	sort.Slice(out, func(i, j int) bool { return out[i].PID < out[j].PID })
	return out, nil
}

type limited struct {
	f *os.File
	n int
}

func (l *limited) Read(p []byte) (int, error) {
	if l.n <= 0 {
		return 0, errors.New("entry too large")
	}
	if len(p) > l.n {
		p = p[:l.n]
	}
	n, err := l.f.Read(p)
	l.n -= n
	return n, err
}

var fromRE = regexp.MustCompile(`^[A-Za-z0-9%:_/.-]+$`)

// encPath percent-encodes every byte outside the wire class (ircc m27).
func encPath(s string) string {
	var b strings.Builder
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || strings.IndexByte(":_/.-", c) >= 0 {
			b.WriteByte(c)
		} else {
			fmt.Fprintf(&b, "%%%02X", c)
		}
	}
	return b.String()
}

// Frame builds one wire line: a user message from the endpoint at fromSock,
// shown to the receiver as sent by fromName. The sender class is "prompting",
// the safe one: a receiver that skips permission prompts holds the frame.
func Frame(fromSock, fromName, body string) ([]byte, error) {
	if !filepath.IsAbs(fromSock) || filepath.Clean(fromSock) != fromSock || !strings.HasSuffix(fromSock, ".sock") {
		return nil, fmt.Errorf("peer: from socket %q: want clean absolute path ending .sock", fromSock)
	}
	from := "uds:" + encPath(fromSock)
	if !fromRE.MatchString(from) {
		return nil, errors.New("peer: from address outside the wire class")
	}
	if fromName == "" || strings.ContainsAny(fromName, "<>\"\\\r\n") {
		return nil, fmt.Errorf("peer: name %q has a forbidden character", fromName)
	}
	if strings.Contains(strings.ToLower(body), "</cross-session-message") {
		return nil, errors.New("peer: body contains " + closeTag)
	}
	if strings.TrimSpace(body) == "" {
		return nil, errors.New("peer: empty body")
	}
	var u [16]byte
	if _, err := rand.Read(u[:]); err != nil {
		return nil, err
	}
	u[6] = u[6]&0x0f | 0x40
	u[8] = u[8]&0x3f | 0x80
	id := fmt.Sprintf("%x-%x-%x-%x-%x", u[0:4], u[4:6], u[6:8], u[8:10], u[10:])
	content := `<cross-session-message from="` + from + `" from-name="` + fromName +
		`" from-mode="prompting">` + "\n" + body + "\n" + closeTag
	type msg struct {
		Role    string `json:"role"`
		Content string `json:"content"`
	}
	b, err := json.Marshal(struct {
		MsgV     int    `json:"msgV"`
		MsgID    string `json:"msg_id"`
		Type     string `json:"type"`
		Message  msg    `json:"message"`
		Priority string `json:"priority"`
		From     string `json:"from"`
	}{1, id, "user", msg{"user", content}, "next", from})
	if err != nil {
		return nil, err
	}
	if len(b) > maxFrame {
		return nil, errors.New("peer: frame over 1 MiB")
	}
	return append(b, '\n'), nil
}

// Send writes one frame to the session's socket and closes.
func Send(sock string, frame []byte) error {
	c, err := net.DialTimeout("unix", sock, sendTimeout)
	if err != nil {
		return fmt.Errorf("peer: dial %s: %w", sock, err)
	}
	defer func() { _ = c.Close() }()
	if err := c.SetDeadline(time.Now().Add(sendTimeout)); err != nil {
		return err
	}
	if _, err := c.Write(frame); err != nil {
		return fmt.Errorf("peer: write %s: %w", sock, err)
	}
	return nil
}

// Endpoint is gebed's own socket. Sessions need a live from address to reply
// to; gebed reads what arrives and hands it to onFrame (replies normally
// travel as bead comments, which gebed shows live).
type Endpoint struct {
	Path string
	l    *net.UnixListener
}

// Listen binds path (mode 0600). A live socket there means another gebed owns
// it: Listen then returns ErrInUse and the caller keeps sending from that path.
var ErrInUse = errors.New("peer: endpoint in use")

func Listen(path string, onFrame func([]byte)) (*Endpoint, error) {
	if fi, err := os.Lstat(path); err == nil {
		if fi.Mode().Type() != os.ModeSocket {
			return nil, fmt.Errorf("peer: %s exists and is not a socket", path)
		}
		if c, err := net.DialTimeout("unix", path, sendTimeout); err == nil {
			_ = c.Close()
			return nil, ErrInUse
		}
		if err := os.Remove(path); err != nil {
			return nil, err
		}
	}
	l, err := net.ListenUnix("unix", &net.UnixAddr{Name: path, Net: "unix"})
	if err != nil {
		return nil, err
	}
	if err := os.Chmod(path, 0o600); err != nil {
		_ = l.Close()
		return nil, err
	}
	e := &Endpoint{Path: path, l: l}
	go func() {
		for {
			c, err := l.AcceptUnix()
			if err != nil {
				return
			}
			go func() {
				defer func() { _ = c.Close() }()
				_ = c.SetDeadline(time.Now().Add(sendTimeout))
				buf := make([]byte, maxFrame)
				n, _ := c.Read(buf)
				if n > 0 {
					onFrame(buf[:n])
				}
			}()
		}
	}()
	return e, nil
}

func (e *Endpoint) Close() error { return e.l.Close() }

// Net is the production session list and sender.
type Net struct {
	SessDir  string // ~/.claude/sessions
	ProcRoot string // /proc
	FromSock string // gebed's own endpoint, the reply address
	FromName string
}

func (n Net) List() ([]Session, error) { return Scan(n.SessDir, n.ProcRoot) }

func (n Net) Send(s Session, body string) error {
	f, err := Frame(n.FromSock, n.FromName, body)
	if err != nil {
		return err
	}
	return Send(s.Socket, f)
}
