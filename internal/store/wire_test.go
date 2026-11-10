package store

import (
	"os"
	"strings"
	"testing"

	"gebed/internal/model"
)

func fixture(t *testing.T, name string) []byte {
	t.Helper()
	b, err := os.ReadFile("testdata/" + name)
	if err != nil {
		t.Fatal(err)
	}
	return b
}

func TestBrList(t *testing.T) {
	bs, err := DecodeBrList(fixture(t, "br-list.json"))
	if err != nil {
		t.Fatal(err)
	}
	if len(bs) != 2 || bs[0].ID.String() != "br-aki" || bs[0].Kind.String() != "task" ||
		bs[0].Priority.Int() != 1 || len(bs[0].Labels) != 1 || bs[0].DepCount != 1 ||
		bs[1].Kind.String() != "epic" || bs[1].DependentCount != 1 {
		t.Fatalf("got %+v", bs)
	}
}

func TestBdList(t *testing.T) {
	bs, err := DecodeBdList(fixture(t, "bd-list.json"))
	if err != nil {
		t.Fatal(err)
	}
	if len(bs) != 1 || bs[0].ID.String() != "bd-rfo" || bs[0].Owner == "" || bs[0].Labels != nil {
		t.Fatalf("got %+v", bs)
	}
}

func TestShowDeps(t *testing.T) {
	b, err := DecodeShow(fixture(t, "br-show.json"))
	if err != nil {
		t.Fatal(err)
	}
	if len(b.Deps) != 1 || b.Deps[0].On.String() != "br-0mp" || b.Deps[0].Type.String() != "blocks" {
		t.Fatalf("got %+v", b.Deps)
	}
}

func TestShowBd(t *testing.T) {
	b, err := DecodeShow(fixture(t, "bd-show.json"))
	if err != nil {
		t.Fatal(err)
	}
	if b.ID.String() != "bd-rfo" || b.Status != model.Open {
		t.Fatalf("got %+v", b)
	}
}

// Negative controls: invalid wire data must be rejected, not defaulted.
func TestRejects(t *testing.T) {
	for name, raw := range map[string]string{
		"empty id":     `[{"id":"","title":"x","status":"open","priority":1,"issue_type":"task"}]`,
		"empty status": `[{"id":"a","title":"x","status":"","priority":1,"issue_type":"task"}]`,
		"priority 9":   `[{"id":"a","title":"x","status":"open","priority":9,"issue_type":"task"}]`,
		"two rows":     `[{"id":"a","status":"open","issue_type":"t"},{"id":"b","status":"open","issue_type":"t"}]`,
	} {
		if _, err := DecodeShow([]byte(raw)); err == nil {
			t.Errorf("%s: accepted", name)
		}
	}
	if _, err := DecodeBrList([]byte(strings.Repeat("x", 3))); err == nil {
		t.Error("garbage accepted")
	}
}
