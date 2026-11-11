package search

import "testing"

func docs() []Doc {
	return []Doc{
		{Repo: "r", ID: "r-1", Title: "Fix token refresh race", Status: "open", Fields: []Field{
			{"id", "r-1", 4}, {"title", "Fix token refresh race", 3},
			{"description", "Sessions expire while a refresh is in flight", 1},
			{"comment", "ana: the needle is in the cache layer", 1},
			{"due", "2026-11-20", 1},
		}},
		{Repo: "r", ID: "r-2", Title: "Write onboarding docs", Status: "open", Fields: []Field{
			{"id", "r-2", 4}, {"title", "Write onboarding docs", 3}, {"description", "", 1}, {"created", "2026-10-02", 1},
		}},
		{Repo: "r", ID: "r-3", Title: "Rework the release", Status: "closed", Fields: []Field{
			{"id", "r-3", 4}, {"title", "Rework the release", 3}, {"labels", "infra ci", 2},
		}},
	}
}

func ids(hs []Hit) []string {
	var out []string
	for _, h := range hs {
		out = append(out, h.ID)
	}
	return out
}

func eq(t *testing.T, got []string, want ...string) {
	t.Helper()
	if len(got) != len(want) {
		t.Fatalf("got %v want %v", got, want)
	}
	for i := range got {
		if got[i] != want[i] {
			t.Fatalf("got %v want %v", got, want)
		}
	}
}

func TestExactFindsEveryField(t *testing.T) {
	eq(t, ids(Exact("needle", docs(), 10)), "r-1")     // comment
	eq(t, ids(Exact("2026-11", docs(), 10)), "r-1")    // date
	eq(t, ids(Exact("onboarding", docs(), 10)), "r-2") // title
	eq(t, ids(Exact("r-3", docs(), 10)), "r-3")        // id
	eq(t, ids(Exact("ci", docs(), 10)), "r-3")         // label
}

func TestExactNeedsEveryWordAndIgnoresCase(t *testing.T) {
	eq(t, ids(Exact("TOKEN race", docs(), 10)), "r-1")
	eq(t, ids(Exact("token onboarding", docs(), 10))) // no bead has both
	if Exact("", docs(), 10) != nil || Exact("   ", docs(), 10) != nil {
		t.Error("an empty query must find nothing")
	}
}

func TestExactIsNotFuzzy(t *testing.T) {
	eq(t, ids(Exact("tkn", docs(), 10)))
}

func TestFuzzyMatchesLettersInOrder(t *testing.T) {
	eq(t, ids(Fuzzy("tkn", docs(), 10)), "r-1")
	eq(t, ids(Fuzzy("onbrd", docs(), 10)), "r-2")
	eq(t, ids(Fuzzy("zzz", docs(), 10)))
}

func TestFuzzyPrefersTightWordStartMatches(t *testing.T) {
	ds := []Doc{
		{ID: "scattered", Fields: []Field{{"title", "a big alpha mountain lake xylophone", 3}}},
		{ID: "tight", Fields: []Field{{"title", "login", 3}}},
		{ID: "loose", Fields: []Field{{"title", "lots of old gears in nothing", 3}}},
	}
	eq(t, ids(Fuzzy("login", ds, 10))[:1], "tight")
}

func TestHitNamesTheField(t *testing.T) {
	h := Exact("needle", docs(), 10)[0]
	if h.Field != "comment" || h.Snippet == "" {
		t.Fatalf("%+v", h)
	}
	if h := Exact("r-3", docs(), 10)[0]; h.Field != "id" {
		t.Errorf("id match reported as %s", h.Field)
	}
}

func TestLimit(t *testing.T) {
	if n := len(Fuzzy("r", docs(), 2)); n != 2 {
		t.Errorf("limit ignored: %d", n)
	}
}

func TestSnippetKeepsUTF8(t *testing.T) {
	s := snippet("ééééééééééééééééééééééééééééééééééééééééééééneedleéééééééééééééééééééééééééééééééééééééééééééé", 90, 6)
	for _, r := range s {
		if r == '�' {
			t.Fatalf("broke a character: %q", s)
		}
	}
}
