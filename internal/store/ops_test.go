package store

import (
	"context"
	"slices"
	"testing"

	"gebed/internal/model"
)

func must[T any](v T, err error) T {
	if err != nil {
		panic(err)
	}
	return v
}

func TestArgv(t *testing.T) {
	id := must(model.ParseID("x-1"))
	dash := must(model.ParseTitle("-rf everything"))
	for name, tc := range map[string]struct {
		op   Op
		want []string
	}{
		"title with leading dash stays inside its flag": {SetTitle{id, dash},
			[]string{"update", "x-1", "--title=-rf everything", "--json"}},
		"create": {Create{dash, model.Bug, must(model.ParsePriority(0))},
			[]string{"create", "--title=-rf everything", "--type=bug", "--priority=0", "--json"}},
		"status":         {SetStatus{id, model.InProgress}, []string{"update", "x-1", "--status=in_progress", "--json"}},
		"label":          {AddLabel{id, must(model.ParseLabel("ui"))}, []string{"label", "add", "x-1", "ui", "--json"}},
		"close":          {Close{id, "done"}, []string{"close", "x-1", "--json", "--reason=done"}},
		"close bare":     {Close{id, ""}, []string{"close", "x-1", "--json"}},
		"dep":            {AddDep{id, must(model.ParseRef("y-2")), model.Blocks}, []string{"dep", "add", "x-1", "y-2", "--type=blocks", "--json"}},
		"cross-repo dep": {AddDep{id, must(model.ParseRef("external:bd:bd-rfo")), model.Blocks}, []string{"dep", "add", "x-1", "external:bd:bd-rfo", "--type=blocks", "--json"}},
	} {
		if got := tc.op.argv(); !slices.Equal(got, tc.want) {
			t.Errorf("%s: got %q want %q", name, got, tc.want)
		}
	}
}

func TestApplyReturnsIDs(t *testing.T) {
	run := func(out string) Runner {
		return func(context.Context, string, string, ...string) ([]byte, error) { return []byte(out), nil }
	}
	c := &CLI{Backend: Br}
	c.Run = run(`{"id":"new-1","title":"t"}`)
	got, err := c.Apply(context.Background(), Create{must(model.ParseTitle("t")), model.Task, must(model.ParsePriority(2))})
	if err != nil || got.String() != "new-1" {
		t.Fatalf("object: %v %v", got, err)
	}
	c.Run = run(`[{"id":"new-2"}]`)
	if got, err := c.Apply(context.Background(), Create{must(model.ParseTitle("t")), model.Task, must(model.ParsePriority(2))}); err != nil || got.String() != "new-2" {
		t.Fatalf("array: %v %v", got, err)
	}
	c.Run = run(`not json`)
	if _, err := c.Apply(context.Background(), Create{must(model.ParseTitle("t")), model.Task, must(model.ParsePriority(2))}); err == nil {
		t.Fatal("garbage create output accepted")
	}
	id := must(model.ParseID("x-1"))
	if got, err := c.Apply(context.Background(), Reopen{id}); err != nil || got != id {
		t.Fatalf("reopen: %v %v", got, err)
	}
}

func TestAddCommentArgv(t *testing.T) {
	op := AddComment{must(model.ParseID("x-1")), must(model.ParseAuthor("Victor Borja")), must(model.ParseBody("--all @impl"))}
	want := []string{"comments", "add", "x-1", "--author=Victor Borja", "--json", "--", "--all @impl"}
	if got := op.argv(); !slices.Equal(got, want) {
		t.Fatalf("got %q", got)
	}
}

func TestSetScheduleArgv(t *testing.T) {
	op := SetSchedule{must(model.ParseID("x-1")), must(model.ParseDate("2026-11-20")), must(model.ParseDays(3))}
	want := []string{"update", "x-1", "--due=2026-11-20", "--estimate=4320", "--json"}
	if got := op.argv(); !slices.Equal(got, want) {
		t.Fatalf("got %q", got)
	}
}

func TestRemoveDepArgv(t *testing.T) {
	op := RemoveDep{must(model.ParseID("c-1")), must(model.ParseRef("e-1"))}
	want := []string{"dep", "remove", "c-1", "e-1", "--json"}
	if got := op.argv(); !slices.Equal(got, want) {
		t.Fatalf("got %q", got)
	}
}
