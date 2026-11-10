package store

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"testing"

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
