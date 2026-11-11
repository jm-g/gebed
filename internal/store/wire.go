package store

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"gebed/internal/model"
)

// issue is the JSON row shared by `br` and `bd` (list and show). Both CLIs use
// the same field names; they differ in envelope and extra fields only.
type issue struct {
	ID             string     `json:"id"`
	Title          string     `json:"title"`
	Description    string     `json:"description"`
	Design         string     `json:"design"`
	Acceptance     string     `json:"acceptance_criteria"`
	Notes          string     `json:"notes"`
	Status         string     `json:"status"`
	Priority       int        `json:"priority"`
	IssueType      string     `json:"issue_type"`
	Assignee       string     `json:"assignee"`
	Owner          string     `json:"owner"`
	Labels         []string   `json:"labels"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	ClosedAt       *time.Time `json:"closed_at"`
	DueAt          *time.Time `json:"due_at"`
	CommentCount   int        `json:"comment_count"`
	EstimateMin    int        `json:"estimated_minutes"`
	CloseReason    string     `json:"close_reason"`
	DepCount       int        `json:"dependency_count"`
	DependentCount int        `json:"dependent_count"`
	Deps           []depRow   `json:"dependencies"`
}

// depRow is an entry of `.dependencies`. br and bd show it as the resolved target
// issue (id, dependency_type); bd list shows the raw edge (depends_on_id, type),
// which also holds cross-repo links that show leaves out.
type depRow struct {
	ID             string `json:"id"`
	DependencyType string `json:"dependency_type"`
	DependsOnID    string `json:"depends_on_id"`
	Type           string `json:"type"`
}

func (d depRow) target() (string, string) {
	if d.ID != "" {
		return d.ID, d.DependencyType
	}
	return d.DependsOnID, d.Type
}

func (w issue) bead() (model.Bead, error) {
	id, err := model.ParseID(w.ID)
	if err != nil {
		return model.Bead{}, err
	}
	st, err := model.ParseStatus(w.Status)
	if err != nil {
		return model.Bead{}, fmt.Errorf("%s: %w", w.ID, err)
	}
	k, err := model.ParseKind(w.IssueType)
	if err != nil {
		return model.Bead{}, fmt.Errorf("%s: %w", w.ID, err)
	}
	p, err := model.ParsePriority(w.Priority)
	if err != nil {
		return model.Bead{}, fmt.Errorf("%s: %w", w.ID, err)
	}
	deps := make([]model.Dep, 0, len(w.Deps))
	for _, d := range w.Deps {
		to, kind := d.target()
		on, err := model.ParseRef(to)
		if err != nil {
			return model.Bead{}, fmt.Errorf("%s dep: %w", w.ID, err)
		}
		t, err := model.ParseDepType(kind)
		if err != nil {
			return model.Bead{}, fmt.Errorf("%s dep %s: %w", w.ID, to, err)
		}
		deps = append(deps, model.Dep{On: on, Type: t})
	}
	return model.Bead{
		ID: id, Title: w.Title, Description: w.Description, Design: w.Design,
		Acceptance: w.Acceptance, Notes: w.Notes, Status: st, Kind: k, Priority: p,
		Assignee: w.Assignee, Owner: w.Owner, Labels: w.Labels,
		Created: w.CreatedAt, Updated: w.UpdatedAt, Closed: w.ClosedAt, Due: w.DueAt, CommentCount: w.CommentCount, EstimateMin: w.EstimateMin,
		CloseReason: w.CloseReason, DepCount: w.DepCount, DependentCount: w.DependentCount,
		Deps: deps,
	}, nil
}

func beads(rows []issue) ([]model.Bead, error) {
	out := make([]model.Bead, 0, len(rows))
	for _, r := range rows {
		b, err := r.bead()
		if err != nil {
			return nil, err
		}
		out = append(out, b)
	}
	return out, nil
}

// DecodeBrList decodes `br list --json`: an envelope {issues:[...]}.
func DecodeBrList(raw []byte) ([]model.Bead, error) {
	var env struct {
		Issues []issue `json:"issues"`
	}
	if err := json.Unmarshal(raw, &env); err != nil {
		return nil, fmt.Errorf("br list: %w", err)
	}
	return beads(env.Issues)
}

// DecodeBdList decodes `bd list --json`: a bare array.
func DecodeBdList(raw []byte) ([]model.Bead, error) {
	var rows []issue
	if err := json.Unmarshal(raw, &rows); err != nil {
		return nil, fmt.Errorf("bd list: %w", err)
	}
	return beads(rows)
}

// DecodeShow decodes `br show --json` and `bd show --json`: an array of one.
func DecodeShow(raw []byte) (model.Bead, error) {
	var rows []issue
	if err := json.Unmarshal(raw, &rows); err != nil {
		return model.Bead{}, fmt.Errorf("show: %w", err)
	}
	if len(rows) != 1 {
		return model.Bead{}, fmt.Errorf("show: want 1 issue, got %d", len(rows))
	}
	return rows[0].bead()
}

// DecodeComments decodes `comments <id> --json` of br and bd: an array. The id is
// a number in br and a string in bd, so it is read raw and kept as text.
func DecodeComments(raw []byte) ([]model.Comment, error) {
	var rows []struct {
		ID      json.RawMessage `json:"id"`
		Author  string          `json:"author"`
		Text    string          `json:"text"`
		Created time.Time       `json:"created_at"`
	}
	if err := json.Unmarshal(raw, &rows); err != nil {
		return nil, fmt.Errorf("comments: %w", err)
	}
	out := make([]model.Comment, 0, len(rows))
	for _, r := range rows {
		a, err := model.ParseAuthor(r.Author)
		if err != nil {
			return nil, err
		}
		b, err := model.ParseBody(r.Text)
		if err != nil {
			return nil, err
		}
		out = append(out, model.Comment{ID: strings.Trim(string(r.ID), `"`), Author: a, Body: b, Created: r.Created})
	}
	return out, nil
}

// DecodeEdges decodes the raw edge records of `br dep list` and `bd dep list`
// (several ids): a flat array of {issue_id, depends_on_id, type}.
func DecodeEdges(raw []byte) ([]model.Edge, error) {
	var rows []struct {
		From string `json:"issue_id"`
		To   string `json:"depends_on_id"`
		Type string `json:"type"`
	}
	if err := json.Unmarshal(raw, &rows); err != nil {
		return nil, fmt.Errorf("edges: %w", err)
	}
	out := make([]model.Edge, 0, len(rows))
	for _, r := range rows {
		from, err := model.ParseID(r.From)
		if err != nil {
			return nil, err
		}
		to, err := model.ParseRef(r.To)
		if err != nil {
			return nil, err
		}
		t, err := model.ParseDepType(r.Type)
		if err != nil {
			return nil, err
		}
		out = append(out, model.Edge{From: from, To: to, Type: t})
	}
	return out, nil
}
