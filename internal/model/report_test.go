package model

import (
	"strings"
	"testing"
)

func TestReportRoundTrip(t *testing.T) {
	r, err := NewReport("impl", "success", 5, 3, 42, 2, 120000, 85, 10, 0, 3, 90, "found a race in the refresh path\nsecond line")
	if err != nil {
		t.Fatal(err)
	}
	got, ok, err := ParseReport(r.String())
	if !ok || err != nil || got != r {
		t.Fatalf("%v %v\n got %+v\nwant %+v", ok, err, got, r)
	}
	if !strings.HasPrefix(r.String(), "report: {") || !strings.Contains(r.String(), "\nfound a race") {
		t.Errorf("shape: %q", r.String())
	}
}

func TestAnythingElseIsNotAReport(t *testing.T) {
	for _, s := range []string{"", "hello @impl", "the report: is late", "  report:{}"} {
		if _, ok, err := ParseReport(s); ok || err != nil {
			t.Errorf("%q: ok=%v err=%v", s, ok, err)
		}
	}
}

func TestInvalidReportsAreRejected(t *testing.T) {
	for name, s := range map[string]string{
		"no outcome":       `report: {"weight":3}`,
		"bad outcome":      `report: {"outcome":"great"}`,
		"typo in a field":  `report: {"outcome":"success","wieght":3}`,
		"weight too big":   `report: {"outcome":"success","weight":500}`,
		"complexity 9":     `report: {"outcome":"success","complexity":9}`,
		"negative minutes": `report: {"outcome":"success","minutes":-5}`,
		"not json":         `report: success`,
		"confidence 120":   `report: {"outcome":"success","confidence":120}`,
	} {
		if _, ok, err := ParseReport(s); !ok || err == nil {
			t.Errorf("%s: ok=%v err=%v", name, ok, err)
		}
	}
	if _, err := NewReport("a\nb", "success", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ""); err == nil {
		t.Error("multi-line agent name accepted")
	}
}

func TestLabelsAndLabelInt(t *testing.T) {
	r, _ := NewReport("", "failure", 8, 4, 0, 0, 0, 0, 0, 0, 0, 0, "")
	want := []string{"outcome:failure", "weight:8", "complexity:4"}
	for i, l := range r.Labels() {
		if l != want[i] {
			t.Errorf("label %d = %s", i, l)
		}
		if _, err := ParseLabel(l); err != nil {
			t.Errorf("%s is not a valid label: %v", l, err)
		}
	}
	if LabelInt([]string{"ui", "weight:13"}, "weight") != 13 || LabelInt([]string{"weight:x"}, "weight") != 0 || LabelInt(nil, "weight") != 0 {
		t.Error("LabelInt")
	}
}
