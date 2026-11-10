package theme

import (
	"fmt"
	"strings"
	"testing"
)

func scheme(system string, n int) string {
	var b strings.Builder
	fmt.Fprintf(&b, "system: %q\nname: \"T\"\nvariant: \"dark\"\npalette:\n", system)
	for i := 0; i < n; i++ {
		fmt.Fprintf(&b, "  base%02X: \"%06x\"\n", i, i*1000)
	}
	return b.String()
}

func TestBuiltinValid(t *testing.T) {
	bs := Builtin()
	if len(bs) < 2 {
		t.Fatalf("got %d builtin schemes", len(bs))
	}
	for _, s := range bs {
		if s.System != "base16" || s.Palette["base00"][0] != '#' {
			t.Errorf("%s: %+v", s.Name, s)
		}
	}
}

func TestBase24(t *testing.T) {
	s, err := Parse([]byte(scheme("base24", 24)))
	if err != nil || len(s.Palette) != 24 || s.Palette["base17"] == "" {
		t.Fatalf("%v %v", s, err)
	}
}

func TestRejects(t *testing.T) {
	for name, in := range map[string]string{
		"base24 with 16":  scheme("base24", 16),
		"base16 with 24":  scheme("base16", 24),
		"unknown system":  scheme("base99", 16),
		"bad color":       strings.Replace(scheme("base16", 16), "000000", "zzzzzz", 1),
		"bad palette key": scheme("base16", 16) + "  hello: \"ffffff\"\n",
	} {
		if _, err := Parse([]byte(in)); err == nil {
			t.Errorf("%s accepted", name)
		}
	}
}
