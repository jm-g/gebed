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

func TestComments(t *testing.T) {
	for name, wantID := range map[string]string{"br-comments.json": "1", "bd-comments.json": "478da3b3-56bf-558b-9d75-fcff7e2b3b25"} {
		cs, err := DecodeComments(fixture(t, name))
		if err != nil || len(cs) != 1 || cs[0].ID != wantID || cs[0].Body.String() != "hello @impl" {
			t.Fatalf("%s: %v %+v", name, err, cs)
		}
		if m := cs[0].Body.Mentions(); len(m) != 1 || m[0] != "impl" {
			t.Errorf("%s: mentions %q", name, m)
		}
	}
	if _, err := DecodeComments([]byte(`[{"id":1,"author":"","text":"x"}]`)); err == nil {
		t.Error("empty author accepted")
	}
}

func TestEdges(t *testing.T) {
	es, err := DecodeEdges(fixture(t, "br-edges.json"))
	if err != nil || len(es) != 1 || es[0].To.Project != "bd" || es[0].To.ID.String() != "bd-rfo" || es[0].Type.String() != "related" {
		t.Fatalf("br: %v %+v", err, es)
	}
	es, err = DecodeEdges(fixture(t, "bd-edges.json"))
	if err != nil || len(es) != 2 || es[0].To.Project != "br" || es[1].To.Project != "" {
		t.Fatalf("bd: %v %+v", err, es)
	}
	if _, err := DecodeEdges([]byte(`[{"issue_id":"a","depends_on_id":"external:x","type":"blocks"}]`)); err == nil {
		t.Error("malformed external ref accepted")
	}
}
