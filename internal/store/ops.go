package store

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"

	"gebed/internal/model"
)

// Op is one edit. The set is closed (argv is unexported) and every field is a
// validated model value, so no op can carry text that a CLI reads as a flag.
// User text always travels as --flag=value, never as a separate word.
type Op interface {
	argv() []string
	// target is the bead the op changes; Create has none.
	target() (model.ID, bool)
}

type Create struct {
	Title    model.Title
	Kind     model.Kind
	Priority model.Priority
}

type SetTitle struct {
	ID    model.ID
	Title model.Title
}

type SetStatus struct {
	ID     model.ID
	Status model.Status
}

type SetPriority struct {
	ID       model.ID
	Priority model.Priority
}

type AddLabel struct {
	ID    model.ID
	Label model.Label
}

type RemoveLabel struct {
	ID    model.ID
	Label model.Label
}

// Close ends a bead; Reason may be empty.
type Close struct {
	ID     model.ID
	Reason string
}

type Reopen struct{ ID model.ID }

// AddDep makes From depend on On, a bead of this repo or of another registered repo.
type AddDep struct {
	From model.ID
	On   model.Ref
	Type model.DepType
}

func (o Create) argv() []string {
	return []string{"create", "--title=" + o.Title.String(), "--type=" + o.Kind.String(),
		"--priority=" + strconv.Itoa(o.Priority.Int()), "--json"}
}
func (o SetTitle) target() (model.ID, bool) { return o.ID, true }
func (o SetTitle) argv() []string {
	return []string{"update", o.ID.String(), "--title=" + o.Title.String(), "--json"}
}
func (o SetStatus) argv() []string {
	return []string{"update", o.ID.String(), "--status=" + o.Status.String(), "--json"}
}
func (o SetPriority) argv() []string {
	return []string{"update", o.ID.String(), "--priority=" + strconv.Itoa(o.Priority.Int()), "--json"}
}
func (o AddLabel) argv() []string {
	return []string{"label", "add", o.ID.String(), o.Label.String(), "--json"}
}
func (o RemoveLabel) argv() []string {
	return []string{"label", "remove", o.ID.String(), o.Label.String(), "--json"}
}
func (o Close) argv() []string {
	a := []string{"close", o.ID.String(), "--json"}
	if o.Reason != "" {
		a = append(a, "--reason="+o.Reason)
	}
	return a
}
func (o Reopen) argv() []string { return []string{"reopen", o.ID.String(), "--json"} }
func (o AddDep) argv() []string {
	return []string{"dep", "add", o.From.String(), o.On.String(), "--type=" + o.Type.String(), "--json"}
}

func (Create) target() (model.ID, bool)        { return model.ID{}, false }
func (o SetStatus) target() (model.ID, bool)   { return o.ID, true }
func (o SetPriority) target() (model.ID, bool) { return o.ID, true }
func (o AddLabel) target() (model.ID, bool)    { return o.ID, true }
func (o RemoveLabel) target() (model.ID, bool) { return o.ID, true }
func (o Close) target() (model.ID, bool)       { return o.ID, true }
func (o Reopen) target() (model.ID, bool)      { return o.ID, true }
func (o AddDep) target() (model.ID, bool)      { return o.From, true }

// Apply runs op and returns the id of the bead it created or changed.
func (c *CLI) Apply(ctx context.Context, op Op) (model.ID, error) {
	out, err := c.Run(ctx, c.Dir, c.Backend.bin, op.argv()...)
	if err != nil {
		return model.ID{}, err
	}
	if id, ok := op.target(); ok {
		return id, nil
	}
	return createdID(out)
}

// createdID reads the id out of `create --json` (an object, or an array of one).
func createdID(raw []byte) (model.ID, error) {
	var one struct {
		ID string `json:"id"`
	}
	if err := json.Unmarshal(raw, &one); err != nil {
		var many []struct {
			ID string `json:"id"`
		}
		if err2 := json.Unmarshal(raw, &many); err2 != nil || len(many) != 1 {
			return model.ID{}, fmt.Errorf("create: unreadable output: %w", err)
		}
		one.ID = many[0].ID
	}
	return model.ParseID(one.ID)
}

// AddComment appends a comment to a bead's discussion. The text follows "--" so
// it can never be read as a flag; the author travels inside --author=.
type AddComment struct {
	ID     model.ID
	Author model.Author
	Body   model.Body
}

func (o AddComment) argv() []string {
	return []string{"comments", "add", o.ID.String(), "--author=" + o.Author.String(), "--json", "--", o.Body.String()}
}
func (o AddComment) target() (model.ID, bool) { return o.ID, true }

// SetSchedule sets when a bead is due (the delivery estimate) and how many days
// it takes, so it started at Due minus Days. br and bd both store the two
// without touching the status.
type SetSchedule struct {
	ID   model.ID
	Due  model.Date
	Days model.Days
}

func (o SetSchedule) argv() []string {
	return []string{"update", o.ID.String(), "--due=" + o.Due.String(),
		"--estimate=" + strconv.Itoa(o.Days.EstimateMinutes()), "--json"}
}
func (o SetSchedule) target() (model.ID, bool) { return o.ID, true }

// RemoveDep removes the edge from From to On. It is how a bead leaves an epic.
type RemoveDep struct {
	From model.ID
	On   model.Ref
}

func (o RemoveDep) argv() []string {
	return []string{"dep", "remove", o.From.String(), o.On.String(), "--json"}
}
func (o RemoveDep) target() (model.ID, bool) { return o.From, true }
