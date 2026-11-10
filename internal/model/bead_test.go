package model

import "testing"

func TestRejectFlagLookalikes(t *testing.T) {
	if _, err := ParseID("-rf"); err == nil {
		t.Error("id with leading dash accepted")
	}
	if _, err := ParseStatus("--all"); err == nil {
		t.Error("status with leading dash accepted")
	}
	if _, err := ParseLabel("a,b"); err == nil {
		t.Error("label with comma accepted")
	}
	if _, err := ParseLabel("-x"); err == nil {
		t.Error("label with leading dash accepted")
	}
	if _, err := ParseTitle("two\nlines"); err == nil {
		t.Error("multi-line title accepted")
	}
	if _, err := ParseTitle("   "); err == nil {
		t.Error("blank title accepted")
	}
	if tt, err := ParseTitle("-dash is fine in a title"); err != nil || tt.String() == "" {
		t.Errorf("title with leading dash: %v", err)
	}
}

func TestMentions(t *testing.T) {
	b, _ := ParseBody("@impl please look, cc @impl and @ux-2. mail a@b.com @_x")
	got := b.Mentions()
	if len(got) != 2 || got[0] != "impl" || got[1] != "ux-2" {
		t.Fatalf("got %q", got)
	}
	if _, err := ParseBody("  \n "); err == nil {
		t.Error("blank body accepted")
	}
}

func TestRef(t *testing.T) {
	for in, want := range map[string]string{"x-1": "x-1", "external:bd:bd-rfo": "external:bd:bd-rfo"} {
		r, err := ParseRef(in)
		if err != nil || r.String() != want {
			t.Errorf("%s: %v %v", in, r, err)
		}
	}
	if r, _ := ParseRef("external:bd:bd-rfo"); r.Project != "bd" || r.ID.String() != "bd-rfo" {
		t.Errorf("fields: %+v", r)
	}
	for _, bad := range []string{"external:", "external:bd", "external::x", "external:bd:", "external:-p:x", "-x", ""} {
		if _, err := ParseRef(bad); err == nil {
			t.Errorf("%q accepted", bad)
		}
	}
}
