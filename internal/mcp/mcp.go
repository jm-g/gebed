// Package mcp serves gebed to MCP clients (Claude Code) over stdio. Each tool
// is one request to the running gebed server, so a tool can do exactly what the
// web UI can do, and nothing the API refuses.
package mcp

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

const protocolVersion = "2024-11-05"

type request struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type rpcError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type response struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id"`
	Result  any             `json:"result,omitempty"`
	Error   *rpcError       `json:"error,omitempty"`
}

// Server answers MCP requests by calling the gebed API at Base.
type Server struct {
	Base   string // for example http://127.0.0.1:7878
	Client *http.Client
}

// Serve reads one JSON-RPC message per line from r and writes replies to w
// until r ends. A notification (no id) gets no reply.
func (s *Server) Serve(ctx context.Context, r io.Reader, w io.Writer) error {
	sc := bufio.NewScanner(r)
	sc.Buffer(make([]byte, 1<<20), 8<<20)
	enc := json.NewEncoder(w)
	for sc.Scan() {
		line := bytes.TrimSpace(sc.Bytes())
		if len(line) == 0 {
			continue
		}
		var req request
		if err := json.Unmarshal(line, &req); err != nil {
			if err := enc.Encode(response{JSONRPC: "2.0", ID: json.RawMessage("null"), Error: &rpcError{-32700, "parse error"}}); err != nil {
				return err
			}
			continue
		}
		if len(req.ID) == 0 {
			continue // notification, such as notifications/initialized
		}
		res, rerr := s.handle(ctx, req)
		out := response{JSONRPC: "2.0", ID: req.ID, Result: res, Error: rerr}
		if err := enc.Encode(out); err != nil {
			return err
		}
	}
	return sc.Err()
}

func (s *Server) handle(ctx context.Context, req request) (any, *rpcError) {
	switch req.Method {
	case "initialize":
		return map[string]any{
			"protocolVersion": protocolVersion,
			"capabilities":    map[string]any{"tools": map[string]any{}},
			"serverInfo":      map[string]any{"name": "gebed", "version": "0.1.0"},
		}, nil
	case "ping":
		return map[string]any{}, nil
	case "tools/list":
		list := make([]map[string]any, 0, len(tools))
		for _, t := range tools {
			list = append(list, map[string]any{"name": t.name, "description": t.desc, "inputSchema": t.schema()})
		}
		return map[string]any{"tools": list}, nil
	case "tools/call":
		var p struct {
			Name      string `json:"name"`
			Arguments args   `json:"arguments"`
		}
		if err := json.Unmarshal(req.Params, &p); err != nil {
			return nil, &rpcError{-32602, "bad params: " + err.Error()}
		}
		for _, t := range tools {
			if t.name == p.Name {
				return s.run(ctx, t, p.Arguments), nil
			}
		}
		return nil, &rpcError{-32602, "unknown tool " + p.Name}
	}
	return nil, &rpcError{-32601, "method not found: " + req.Method}
}

// run executes a tool. Failures are tool results with isError, as MCP wants,
// so the agent reads the reason and can fix its call.
func (s *Server) run(ctx context.Context, t tool, a args) map[string]any {
	if a == nil {
		a = args{}
	}
	if err := t.check(a); err != nil {
		return result(err.Error(), true)
	}
	c := t.build(a)
	var body io.Reader
	if c.body != nil {
		b, err := json.Marshal(c.body)
		if err != nil {
			return result(err.Error(), true)
		}
		body = bytes.NewReader(b)
	}
	ctx, cancel := context.WithTimeout(ctx, 60*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, c.method, strings.TrimRight(s.Base, "/")+c.path, body)
	if err != nil {
		return result(err.Error(), true)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	client := s.Client
	if client == nil {
		client = http.DefaultClient
	}
	resp, err := client.Do(req)
	if err != nil {
		return result(fmt.Sprintf("gebed is not reachable at %s: %v. Start it with `gebed`.", s.Base, err), true)
	}
	defer func() { _ = resp.Body.Close() }()
	b, err := io.ReadAll(io.LimitReader(resp.Body, 16<<20))
	if err != nil {
		return result(err.Error(), true)
	}
	if resp.StatusCode >= 300 {
		return result(fmt.Sprintf("gebed answered %d: %s", resp.StatusCode, bytes.TrimSpace(b)), true)
	}
	return result(string(bytes.TrimSpace(b)), false)
}

func result(text string, isError bool) map[string]any {
	r := map[string]any{"content": []map[string]any{{"type": "text", "text": text}}}
	if isError {
		r["isError"] = true
	}
	return r
}

// ToolNames lists the tool names, in the order tools/list returns them.
func ToolNames() []string {
	out := make([]string, 0, len(tools))
	for _, t := range tools {
		out = append(out, t.name)
	}
	return out
}
