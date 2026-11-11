package store

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"testing"
	"time"

	"gebed/internal/model"
)

func repo(t *testing.T, subdirs ...string) string {
	t.Helper()
	d := t.TempDir()
	if err := os.Mkdir(filepath.Join(d, ".beads"), 0o755); err != nil {
		t.Fatal(err)
	}
	for _, s := range subdirs {
		if s == "" {
			continue
		}
		if err := os.Mkdir(filepath.Join(d, ".beads", s), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	return d
}

func TestDetect(t *testing.T) {
	for name, tc := range map[string]struct {
		subdirs []string
		want    Backend
	}{
		"sqlite/jsonl": {nil, Br},
		"embedded":     {[]string{"embeddeddolt"}, Bd},
		"doltdb":       {[]string{"doltdb"}, Bd},
	} {
		got, err := Detect(repo(t, tc.subdirs...))
		if err != nil || got.String() != tc.want.String() {
			t.Errorf("%s: got %v %v", name, got, err)
		}
	}
	if _, err := Detect(t.TempDir()); !errors.Is(err, ErrNoBeads) {
		t.Errorf("no .beads: got %v", err)
	}
}

// fake serves fixtures by CLI name and subcommand; it records the calls.
func fake(t *testing.T, calls *[][]string) Runner {
	return func(_ context.Context, _, bin string, args ...string) ([]byte, error) {
		*calls = append(*calls, append([]string{bin}, args...))
		switch {
		case bin == "br" && args[0] == "list":
			return fixture(t, "br-list.json"), nil
		case bin == "bd" && args[0] == "list":
			return fixture(t, "bd-list.json"), nil
		case bin == "br" && args[0] == "show":
			return fixture(t, "br-show.json"), nil
		}
		return nil, errors.New("unexpected " + bin)
	}
}

func TestCLI(t *testing.T) {
	var calls [][]string
	for _, tc := range []struct {
		sub    string
		want   string
		wantID string
	}{{"", "br", "br-aki"}, {"embeddeddolt", "bd", "bd-rfo"}} {
		s, err := Open(repo(t, tc.sub), fake(t, &calls))
		if err != nil {
			t.Fatal(err)
		}
		bs, err := s.List(context.Background())
		if err != nil || bs[0].ID.String() != tc.wantID {
			t.Fatalf("%s: %v %v", tc.want, bs, err)
		}
		if calls[len(calls)-1][0] != tc.want {
			t.Fatalf("ran %v, want %s", calls[len(calls)-1], tc.want)
		}
	}
	id, _ := model.ParseID("br-aki")
	s, _ := Open(repo(t), fake(t, &calls))
	b, err := s.Get(context.Background(), id)
	if err != nil || len(b.Deps) != 1 {
		t.Fatalf("get: %v %v", b, err)
	}
}

func TestEdgesCalls(t *testing.T) {
	mk := func(id string, deps int) model.Bead {
		i, _ := model.ParseID(id)
		return model.Bead{ID: i, DepCount: deps}
	}
	var calls [][]string
	var mu sync.Mutex
	run := func(_ context.Context, _, bin string, args ...string) ([]byte, error) {
		mu.Lock()
		defer mu.Unlock()
		calls = append(calls, append([]string{bin}, args...))
		return []byte(`[]`), nil
	}
	beads := []model.Bead{mk("a-1", 1), mk("a-2", 0), mk("a-3", 2)}

	calls = nil
	if _, err := (&CLI{Backend: Br, Run: run}).Edges(context.Background(), beads); err != nil {
		t.Fatal(err)
	}
	sort.Slice(calls, func(i, j int) bool { return calls[i][3] < calls[j][3] }) // the calls run at once, in any order
	if len(calls) != 2 || calls[0][3] != "a-1" || calls[1][3] != "a-3" {        // one call per bead with deps, none for a-2
		t.Errorf("br calls %q", calls)
	}

	calls = nil
	if _, err := (&CLI{Backend: Bd, Run: run}).Edges(context.Background(), beads); err != nil {
		t.Fatal(err)
	}
	if len(calls) != 1 || len(calls[0]) != 6 || calls[0][3] != "a-1" || calls[0][4] != "a-3" {
		t.Errorf("bd one batch call: %q", calls)
	}

	calls = nil
	if _, err := (&CLI{Backend: Bd, Run: run}).Edges(context.Background(), beads[:1]); err != nil {
		t.Fatal(err)
	}
	if len(calls) != 1 || calls[0][3] != "a-1" || calls[0][4] != "a-1" { // a lone id is doubled to get raw records
		t.Errorf("bd lone id: %q", calls)
	}

	calls = nil
	if es, _ := (&CLI{Backend: Br, Run: run}).Edges(context.Background(), beads[1:2]); es != nil || len(calls) != 0 {
		t.Errorf("no deps must run nothing: %q", calls)
	}
}

// The br edge reads run at once; the result must still follow the order of the
// beads, whatever order the calls finish in.
func TestEdgesKeepOrderWhenCallsRaceEachOther(t *testing.T) {
	var beads []model.Bead
	for i := 0; i < 20; i++ {
		id, _ := model.ParseID(fmt.Sprintf("a-%02d", i))
		beads = append(beads, model.Bead{ID: id, DepCount: 1})
	}
	run := func(_ context.Context, _, _ string, args ...string) ([]byte, error) {
		id := args[2]
		if id[len(id)-1]%2 == 0 { // some calls finish later than others
			time.Sleep(5 * time.Millisecond)
		}
		return []byte(`[{"issue_id":"` + id + `","depends_on_id":"z-1","type":"blocks"}]`), nil
	}
	es, err := (&CLI{Backend: Br, Run: run}).Edges(context.Background(), beads)
	if err != nil || len(es) != 20 {
		t.Fatalf("%v %d", err, len(es))
	}
	for i, e := range es {
		if e.From.String() != fmt.Sprintf("a-%02d", i) {
			t.Fatalf("edge %d is %s: order lost", i, e.From)
		}
	}
}
