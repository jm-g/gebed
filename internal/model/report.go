package model

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

// Outcome is how a piece of work ended.
type Outcome struct{ s string }

var (
	Success = Outcome{"success"}
	Failure = Outcome{"failure"}
	Partial = Outcome{"partial"}
	Stuck   = Outcome{"blocked"}
)

func ParseOutcome(s string) (Outcome, error) {
	for _, o := range []Outcome{Success, Failure, Partial, Stuck} {
		if o.s == s {
			return o, nil
		}
	}
	return Outcome{}, fmt.Errorf("outcome %q: want success, failure, partial or blocked", s)
}

func (o Outcome) String() string { return o.s }

// Report is what an agent measured and found while it worked on a bead. A zero
// number means "not reported"; every reported number is in range. Reports are
// built only by ParseReport, so a Report in hand is valid.
type Report struct {
	Agent      string  // who worked: a session name
	Outcome    Outcome // how it ended; the only required field
	Weight     int     // size in points the agent assigns (1, 2, 3, 5, 8, 13, 21 ...), 1..100
	Complexity int     // how hard it was, 1 (trivial) to 5 (very hard)
	Minutes    int     // minutes of actual work
	Attempts   int     // tries until it worked, 1 or more
	Tokens     int     // model tokens used
	CostCents  int     // money spent, in cents
	TestsPass  int
	TestsFail  int
	Capacity   int // how many beads this agent can work on at once
	Confidence int // percent sure the result is right, 1..100
	Findings   string
}

// wire is the JSON of the first line. Unknown fields are an error, so a typo in
// a field name is not silently dropped.
type wire struct {
	Agent      string `json:"agent,omitempty"`
	Outcome    string `json:"outcome"`
	Weight     int    `json:"weight,omitempty"`
	Complexity int    `json:"complexity,omitempty"`
	Minutes    int    `json:"minutes,omitempty"`
	Attempts   int    `json:"attempts,omitempty"`
	Tokens     int    `json:"tokens,omitempty"`
	CostCents  int    `json:"costCents,omitempty"`
	TestsPass  int    `json:"testsPass,omitempty"`
	TestsFail  int    `json:"testsFail,omitempty"`
	Capacity   int    `json:"capacity,omitempty"`
	Confidence int    `json:"confidence,omitempty"`
}

const reportPrefix = "report: "

func within(name string, v, lo, hi int) error {
	if v != 0 && (v < lo || v > hi) {
		return fmt.Errorf("%s %d out of range %d..%d", name, v, lo, hi)
	}
	return nil
}

// NewReport validates a report built field by field (for example from an API
// request). findings is free text.
func NewReport(agent, outcome string, weight, complexity, minutes, attempts, tokens, costCents, testsPass, testsFail, capacity, confidence int, findings string) (Report, error) {
	o, err := ParseOutcome(outcome)
	if err != nil {
		return Report{}, err
	}
	agent = strings.TrimSpace(agent)
	if strings.ContainsAny(agent, "\r\n") || len(agent) > 100 {
		return Report{}, errors.New("agent must be one line of at most 100 characters")
	}
	for _, c := range []error{
		within("weight", weight, 1, 100),
		within("complexity", complexity, 1, 5),
		within("minutes", minutes, 1, 525600),
		within("attempts", attempts, 1, 100),
		within("tokens", tokens, 1, 1_000_000_000),
		within("costCents", costCents, 1, 10_000_000),
		within("testsPass", testsPass, 1, 1_000_000),
		within("testsFail", testsFail, 1, 1_000_000),
		within("capacity", capacity, 1, 64),
		within("confidence", confidence, 1, 100),
	} {
		if c != nil {
			return Report{}, c
		}
	}
	if len(findings) > 20000 {
		return Report{}, errors.New("findings over 20000 characters")
	}
	return Report{agent, o, weight, complexity, minutes, attempts, tokens, costCents, testsPass, testsFail, capacity, confidence, findings}, nil
}

// String is the comment text: `report: {json}`, then the findings.
func (r Report) String() string {
	b, err := json.Marshal(wire{r.Agent, r.Outcome.s, r.Weight, r.Complexity, r.Minutes, r.Attempts, r.Tokens, r.CostCents, r.TestsPass, r.TestsFail, r.Capacity, r.Confidence})
	if err != nil { // a struct of strings and ints always marshals
		return reportPrefix + `{"outcome":"` + r.Outcome.s + `"}`
	}
	s := reportPrefix + string(b)
	if strings.TrimSpace(r.Findings) != "" {
		s += "\n" + r.Findings
	}
	return s
}

// ParseReport reads a comment. ok is false when the comment is not a report
// (it has no `report: ` first line); err is set when it claims to be one and is
// not valid, so the caller can tell the author.
func ParseReport(text string) (r Report, ok bool, err error) {
	first, rest, _ := strings.Cut(text, "\n")
	line, found := strings.CutPrefix(strings.TrimSpace(first), reportPrefix)
	if !found {
		return Report{}, false, nil
	}
	var w wire
	dec := json.NewDecoder(bytes.NewReader([]byte(line)))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&w); err != nil {
		return Report{}, true, fmt.Errorf("report: %w", err)
	}
	r, err = NewReport(w.Agent, w.Outcome, w.Weight, w.Complexity, w.Minutes, w.Attempts, w.Tokens, w.CostCents, w.TestsPass, w.TestsFail, w.Capacity, w.Confidence, strings.TrimSpace(rest))
	return r, true, err
}

// Labels are the metrics that also live on the bead as `key:value` labels, so
// br, bd and the boards can filter on them.
func (r Report) Labels() []string {
	out := []string{"outcome:" + r.Outcome.s}
	if r.Weight > 0 {
		out = append(out, fmt.Sprintf("weight:%d", r.Weight))
	}
	if r.Complexity > 0 {
		out = append(out, fmt.Sprintf("complexity:%d", r.Complexity))
	}
	return out
}

// LabelInt reads `key:N` out of a bead's labels; 0 when there is none.
func LabelInt(labels []string, key string) int {
	for _, l := range labels {
		if v, ok := strings.CutPrefix(l, key+":"); ok {
			n := 0
			if _, err := fmt.Sscanf(v, "%d", &n); err == nil && n > 0 {
				return n
			}
		}
	}
	return 0
}
