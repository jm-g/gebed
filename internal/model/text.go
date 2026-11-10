package model

import (
	"fmt"
	"strings"
	"unicode/utf8"
)

// plain reports whether s is a safe CLI word: non-empty, no whitespace, and no
// leading "-", so it can never be read as a flag by br or bd.
func plain(s string) bool {
	return s != "" && s[0] != '-' && !strings.ContainsAny(s, " \t\r\n")
}

// Label is a bead label: a plain word without commas.
type Label struct{ s string }

func ParseLabel(s string) (Label, error) {
	if !plain(s) || strings.Contains(s, ",") {
		return Label{}, fmt.Errorf("invalid label %q", s)
	}
	return Label{s}, nil
}

func (l Label) String() string { return l.s }

// Title is a one-line bead title of 1 to 500 characters.
type Title struct{ s string }

func ParseTitle(s string) (Title, error) {
	s = strings.TrimSpace(s)
	if n := utf8.RuneCountInString(s); n < 1 || n > 500 || strings.ContainsAny(s, "\r\n") {
		return Title{}, fmt.Errorf("title must be 1 to 500 characters on one line")
	}
	return Title{s}, nil
}

func (t Title) String() string { return t.s }
