// Package search finds beads by matching a query against every field of a bead:
// id, title, text, comments, dates and more. Fuzzy mode matches letters in order
// (fzf style) and ranks tight, early, word-start matches first. Exact mode needs
// every word of the query to appear as written, ignoring case.
package search

import (
	"sort"
	"strings"
	"unicode"
)

// Field is one searchable piece of a bead.
type Field struct {
	Name   string
	Text   string
	Weight int // how much a match here is worth; ids and titles weigh most
}

// Doc is a bead as the search sees it.
type Doc struct {
	Repo, ID, Title, Status string
	Fields                  []Field
}

// Hit is one result: the best field that matched and a snippet around the match.
type Hit struct {
	Repo    string `json:"repo"`
	ID      string `json:"id"`
	Title   string `json:"title"`
	Status  string `json:"status"`
	Field   string `json:"field"`
	Snippet string `json:"snippet"`
	Score   int    `json:"score"`
}

const maxText = 4000 // longer fields are cut; a match deep in a huge text is rare and costly

func clip(s string) string {
	if len(s) > maxText {
		return s[:maxText]
	}
	return s
}

// Exact returns docs where every word of q appears in some field, best first.
func Exact(q string, docs []Doc, limit int) []Hit {
	words := strings.Fields(strings.ToLower(q))
	if len(words) == 0 {
		return nil
	}
	var hits []Hit
	for _, d := range docs {
		h, ok := exactDoc(words, d)
		if ok {
			hits = append(hits, h)
		}
	}
	return rank(hits, limit)
}

func exactDoc(words []string, d Doc) (Hit, bool) {
	total := 0
	var best Hit
	bestScore := -1
	for _, w := range words {
		found := false
		wBest := -1
		for _, f := range d.Fields {
			text := clip(f.Text)
			i := strings.Index(strings.ToLower(text), w)
			if i < 0 {
				continue
			}
			found = true
			s := f.Weight * 10
			if i == 0 || !isWord(rune(text[i-1])) {
				s += 5 // the word starts at a word boundary
			}
			if strings.EqualFold(text, w) {
				s += 20
			}
			if s > wBest {
				wBest = s
			}
			if s > bestScore {
				bestScore = s
				best = hitOf(d, f.Name, snippet(text, i, len(w)))
			}
		}
		if !found {
			return Hit{}, false
		}
		total += wBest
	}
	best.Score = total
	return best, true
}

// Fuzzy returns docs where every word of q matches some field as an in-order
// subsequence, best first.
func Fuzzy(q string, docs []Doc, limit int) []Hit {
	words := strings.Fields(strings.ToLower(q))
	if len(words) == 0 {
		return nil
	}
	var hits []Hit
	for _, d := range docs {
		h, ok := fuzzyDoc(words, d)
		if ok {
			hits = append(hits, h)
		}
	}
	return rank(hits, limit)
}

func fuzzyDoc(words []string, d Doc) (Hit, bool) {
	total := 0
	var best Hit
	bestScore := -1
	for _, w := range words {
		wBest := -1
		for _, f := range d.Fields {
			text := clip(f.Text)
			s, at, ok := fuzzyScore([]rune(w), []rune(text))
			if !ok {
				continue
			}
			s *= f.Weight
			if s > wBest {
				wBest = s
			}
			if s > bestScore {
				bestScore = s
				best = hitOf(d, f.Name, snippet(text, at, len(w)))
			}
		}
		if wBest < 0 {
			return Hit{}, false
		}
		total += wBest
	}
	best.Score = total
	return best, true
}

func isWord(r rune) bool { return unicode.IsLetter(r) || unicode.IsDigit(r) }

// fuzzyScore matches q as a subsequence of text, ignoring case. It tries each
// place the first letter occurs and keeps the best run, so a tight match later
// in the text beats a scattered one at the start. at is the byte offset of the
// match, for the snippet.
func fuzzyScore(q, text []rune) (score, at int, ok bool) {
	low := []rune(strings.ToLower(string(text)))
	if len(low) != len(text) { // lowering changed the length (rare scripts): match as given
		low = text
	}
	best := -1
	for start := range low {
		if low[start] != q[0] {
			continue
		}
		s, matched := run(q, low, text, start)
		if matched && s > best {
			best, at = s, start
		}
	}
	if best < 0 {
		return 0, 0, false
	}
	return best, len(string(text[:at])), true
}

func run(q, low, text []rune, start int) (int, bool) {
	score, prev := 0, -2
	i := start
	for _, c := range q {
		for i < len(low) && low[i] != c {
			i++
		}
		if i == len(low) {
			return 0, false
		}
		score += 16
		if i == prev+1 {
			score += 12 // consecutive letters
		} else if prev >= 0 {
			score -= min(i-prev-1, 8) // gap
		}
		if i == 0 || !isWord(text[i-1]) {
			score += 10 // the letter starts a word
		}
		prev = i
		i++
	}
	if start == 0 {
		score += 8
	}
	return score, true
}

func snippet(text string, at, n int) string {
	const around = 36
	from := max(0, at-around)
	to := min(len(text), at+n+around)
	for from > 0 && from < len(text) && text[from]&0xC0 == 0x80 { // do not cut a UTF-8 character
		from--
	}
	for to < len(text) && text[to]&0xC0 == 0x80 {
		to++
	}
	s := strings.Join(strings.Fields(text[from:to]), " ")
	if from > 0 {
		s = "…" + s
	}
	if to < len(text) {
		s += "…"
	}
	return s
}

func hitOf(d Doc, field, snip string) Hit {
	return Hit{Repo: d.Repo, ID: d.ID, Title: d.Title, Status: d.Status, Field: field, Snippet: snip}
}

func rank(hits []Hit, limit int) []Hit {
	sort.SliceStable(hits, func(i, j int) bool {
		if hits[i].Score != hits[j].Score {
			return hits[i].Score > hits[j].Score
		}
		return hits[i].ID < hits[j].ID
	})
	if limit > 0 && len(hits) > limit {
		hits = hits[:limit]
	}
	return hits
}
