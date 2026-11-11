package mcp

import (
	"fmt"
	"net/url"
)

// prop is one input of a tool.
type prop struct {
	name     string
	typ      string // "string" or "integer"
	desc     string
	required bool
}

// call is the HTTP request a tool makes against the gebed API.
type call struct {
	method string
	path   string
	body   any
}

type tool struct {
	name  string
	desc  string
	props []prop
	// build turns validated arguments into a request. Every web action goes
	// through the same API, so a tool can do whatever the web UI can.
	build func(a args) call
}

type args map[string]any

func (a args) s(k string) string { v, _ := a[k].(string); return v }

func (a args) i(k string) int { v, _ := a[k].(float64); return int(v) }

func esc(s string) string { return url.PathEscape(s) }

var (
	repo   = prop{"repo", "string", "Repo name, as listed by gebed_list_repos.", true}
	beadID = prop{"id", "string", "Bead id, for example br-aki.", true}
)

func beadPath(a args, rest string) string {
	return "/api/repos/" + esc(a.s("repo")) + "/beads/" + esc(a.s("id")) + rest
}

// op posts one edit; fields always carry the op name.
func op(name string, a args, fields map[string]any) call {
	fields["op"] = name
	return call{"POST", "/api/repos/" + esc(a.s("repo")) + "/ops", fields}
}

func idOnly(name string) func(args) call {
	return func(a args) call { return op(name, a, map[string]any{"id": a.s("id")}) }
}

var tools = []tool{
	{"gebed_list_repos", "List the repos gebed shows, with the backend (br or bd) of each.", nil,
		func(args) call { return call{"GET", "/api/repos", nil} }},
	{"gebed_add_repo", "Register a repo: a directory that holds a .beads directory.",
		[]prop{{"dir", "string", "Absolute path of the repo.", true}},
		func(a args) call { return call{"POST", "/api/repos", map[string]any{"dir": a.s("dir")}} }},
	{"gebed_list_beads", "List every bead of a repo, closed ones included.", []prop{repo},
		func(a args) call { return call{"GET", "/api/repos/" + esc(a.s("repo")) + "/beads", nil} }},
	{"gebed_get_bead", "Read one bead with its dependencies.", []prop{repo, beadID},
		func(a args) call { return call{"GET", beadPath(a, ""), nil} }},
	{"gebed_comments", "Read the discussion of a bead: its comments, oldest first.", []prop{repo, beadID},
		func(a args) call { return call{"GET", beadPath(a, "/comments"), nil} }},
	{"gebed_edges", "List the dependency edges of a repo, cross-repo links included.", []prop{repo},
		func(a args) call { return call{"GET", "/api/repos/" + esc(a.s("repo")) + "/edges", nil} }},
	{"gebed_links", "List every cross-repo link of every repo, each end resolved to its current title and status.", nil,
		func(args) call { return call{"GET", "/api/links", nil} }},
	{"gebed_sessions", "List the live Claude Code sessions that can receive a mention.", nil,
		func(args) call { return call{"GET", "/api/sessions", nil} }},
	{"gebed_themes", "List the color schemes (base16 and base24) the web UI can use.", nil,
		func(args) call { return call{"GET", "/api/themes", nil} }},

	{"gebed_create_bead", "Create a bead.",
		[]prop{repo,
			{"title", "string", "One-line title.", true},
			{"kind", "string", "Issue type: task, bug, feature, epic, chore, docs or question.", true},
			{"priority", "integer", "0 (critical) to 4 (backlog).", true}},
		func(a args) call {
			return op("create", a, map[string]any{"title": a.s("title"), "kind": a.s("kind"), "priority": a.i("priority")})
		}},
	{"gebed_set_title", "Rename a bead.",
		[]prop{repo, beadID, {"title", "string", "New one-line title.", true}},
		func(a args) call { return op("setTitle", a, map[string]any{"id": a.s("id"), "title": a.s("title")}) }},
	{"gebed_set_status", "Set the status of a bead: open, in_progress, blocked, deferred or draft. To end a bead use gebed_close.",
		[]prop{repo, beadID, {"status", "string", "The new status.", true}},
		func(a args) call { return op("setStatus", a, map[string]any{"id": a.s("id"), "status": a.s("status")}) }},
	{"gebed_set_priority", "Set the priority of a bead.",
		[]prop{repo, beadID, {"priority", "integer", "0 (critical) to 4 (backlog).", true}},
		func(a args) call {
			return op("setPriority", a, map[string]any{"id": a.s("id"), "priority": a.i("priority")})
		}},
	{"gebed_add_label", "Add a label to a bead.",
		[]prop{repo, beadID, {"label", "string", "One word, no comma.", true}},
		func(a args) call { return op("addLabel", a, map[string]any{"id": a.s("id"), "label": a.s("label")}) }},
	{"gebed_remove_label", "Remove a label from a bead.",
		[]prop{repo, beadID, {"label", "string", "The label to remove.", true}},
		func(a args) call { return op("removeLabel", a, map[string]any{"id": a.s("id"), "label": a.s("label")}) }},
	{"gebed_set_schedule", "Plan a bead on the waterfall: the delivery date and how many days it takes. It starts that many days before the delivery date.",
		[]prop{repo, beadID,
			{"due", "string", "Delivery date, YYYY-MM-DD.", true},
			{"days", "integer", "Length in days, 1 or more.", true}},
		func(a args) call {
			return op("setSchedule", a, map[string]any{"id": a.s("id"), "due": a.s("due"), "days": a.i("days")})
		}},
	{"gebed_close", "Close a bead. Do this only after the owner confirmed the result in the discussion.",
		[]prop{repo, beadID, {"reason", "string", "Why it is closed; cite the evidence.", false}},
		func(a args) call { return op("close", a, map[string]any{"id": a.s("id"), "reason": a.s("reason")}) }},
	{"gebed_reopen", "Reopen a closed bead.", []prop{repo, beadID}, idOnly("reopen")},
	{"gebed_add_dep", "Make a bead depend on another. For a bead of another repo give on as external:<repo>:<id>.",
		[]prop{repo,
			{"from", "string", "The bead that depends on the other.", true},
			{"on", "string", "The bead it depends on: an id, or external:<repo>:<id>.", true},
			{"type", "string", "blocks, parent-child, related, ...", true}},
		func(a args) call {
			return op("addDep", a, map[string]any{"from": a.s("from"), "on": a.s("on"), "type": a.s("type")})
		}},
	{"gebed_remove_dep", "Remove the dependency of one bead on another. This is also how a bead leaves an epic.",
		[]prop{repo,
			{"from", "string", "The bead that depends on the other.", true},
			{"on", "string", "The bead it depends on: an id, or external:<repo>:<id>.", true}},
		func(a args) call { return op("removeDep", a, map[string]any{"from": a.s("from"), "on": a.s("on")}) }},
	{"gebed_search", "Find beads in every repo by id, title, text, comments, labels, epic and dates. mode fuzzy matches letters in order; mode exact needs every word as written.",
		[]prop{{"query", "string", "What to look for.", true}, {"mode", "string", "fuzzy or exact.", true}},
		func(a args) call {
			return call{"GET", "/api/search?mode=" + url.QueryEscape(a.s("mode")) + "&q=" + url.QueryEscape(a.s("query")), nil}
		}},
	{"gebed_comment", "Add a comment to a bead's discussion. An @name in the text sends the comment to the live session with that name; the answer lists who received it.",
		[]prop{repo, beadID, {"text", "string", "The comment. Mention an implementer with @name.", true}},
		func(a args) call { return op("addComment", a, map[string]any{"id": a.s("id"), "text": a.s("text")}) }},
}

// ops names the server op a tool posts, for the coverage test.
func opOf(t tool) string {
	c := t.build(sample(t))
	if m, ok := c.body.(map[string]any); ok {
		if n, ok := m["op"].(string); ok {
			return n
		}
	}
	return ""
}

// sample builds arguments that satisfy t's schema.
func sample(t tool) args {
	a := args{}
	for _, p := range t.props {
		if p.typ == "integer" {
			a[p.name] = float64(1)
		} else {
			a[p.name] = "x"
		}
	}
	return a
}

// check validates arguments against t's schema.
func (t tool) check(a args) error {
	for _, p := range t.props {
		v, present := a[p.name]
		if !present || v == nil {
			if p.required {
				return fmt.Errorf("missing argument %q", p.name)
			}
			continue
		}
		switch p.typ {
		case "string":
			if _, ok := v.(string); !ok {
				return fmt.Errorf("argument %q must be a string", p.name)
			}
		case "integer":
			f, ok := v.(float64)
			if !ok || f != float64(int(f)) {
				return fmt.Errorf("argument %q must be an integer", p.name)
			}
		}
	}
	return nil
}

func (t tool) schema() map[string]any {
	props := map[string]any{}
	var req []string
	for _, p := range t.props {
		props[p.name] = map[string]any{"type": p.typ, "description": p.desc}
		if p.required {
			req = append(req, p.name)
		}
	}
	s := map[string]any{"type": "object", "properties": props}
	if len(req) > 0 {
		s["required"] = req
	}
	return s
}
