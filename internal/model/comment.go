package model

import (
	"fmt"
	"strings"
	"time"
	"unicode/utf8"
)

// Author is a one-line comment author name (a user or an agent), 1 to 100 characters.
type Author struct{ s string }

func ParseAuthor(s string) (Author, error) {
	s = strings.TrimSpace(s)
	if n := utf8.RuneCountInString(s); n < 1 || n > 100 || strings.ContainsAny(s, "\r\n") {
		return Author{}, fmt.Errorf("author must be 1 to 100 characters on one line")
	}
	return Author{s}, nil
}

func (a Author) String() string { return a.s }

// Body is non-blank comment text; it may span lines.
type Body struct{ s string }

func ParseBody(s string) (Body, error) {
	if strings.TrimSpace(s) == "" || utf8.RuneCountInString(s) > 20000 {
		return Body{}, fmt.Errorf("comment must be 1 to 20000 characters")
	}
	return Body{s}, nil
}

func (b Body) String() string { return b.s }

// Comment is one entry of a bead's discussion. ID is opaque: br uses numbers
// and bd uses uuids.
type Comment struct {
	ID      string
	Author  Author
	Body    Body
	Created time.Time
}

// Mentions returns the distinct @names in the text, in order. A name is a run of
// letters, digits, '-', '_' or '.' that starts and ends with a letter or digit.
func (b Body) Mentions() []string {
	var out []string
	seen := map[string]bool{}
	s := b.s
	for i := 0; i < len(s); i++ {
		if s[i] != '@' || (i > 0 && isWord(s[i-1])) {
			continue
		}
		j := i + 1
		for j < len(s) && (isWord(s[j]) || s[j] == '-' || s[j] == '.') {
			j++
		}
		name := strings.TrimRight(s[i+1:j], "-._")
		if name != "" && isAlnum(name[0]) && !seen[name] {
			seen[name] = true
			out = append(out, name)
		}
		i = j - 1
	}
	return out
}

func isAlnum(c byte) bool {
	return c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9'
}

func isWord(c byte) bool { return isAlnum(c) || c == '_' }
