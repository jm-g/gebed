package model

import (
	"testing"
	"time"
)

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

func TestSchedule(t *testing.T) {
	d, err := ParseDate("2026-11-20")
	if err != nil || d.String() != "2026-11-20" {
		t.Fatalf("%v %v", d, err)
	}
	for _, bad := range []string{"", "2026-13-01", "1999-12-31", "2101-01-01", "20-11-2026", "2026-11-20T10:00:00Z"} {
		if _, err := ParseDate(bad); err == nil {
			t.Errorf("%q accepted", bad)
		}
	}
	// br stores 15:00Z and bd 06:00Z for the same day; both read as the same day in UTC-6.
	cst := time.FixedZone("CST", -6*3600)
	for _, ts := range []string{"2026-11-20T15:00:00Z", "2026-11-20T06:00:00Z"} {
		p, _ := time.Parse(time.RFC3339, ts)
		if got := DateOf(p, cst).String(); got != "2026-11-20" {
			t.Errorf("%s read as %s", ts, got)
		}
	}
	if _, err := ParseDays(0); err == nil {
		t.Error("0 days accepted")
	}
	if n, _ := ParseDays(3); n.EstimateMinutes() != 4320 {
		t.Error("3 days is 4320 minutes")
	}
	for min, want := range map[int]int{0: 1, 60: 1, 1440: 1, 1441: 2, 4320: 3} {
		if got := DaysOfMinutes(min).Int(); got != want {
			t.Errorf("%d minutes = %d days, want %d", min, got, want)
		}
	}
}
