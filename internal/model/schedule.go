package model

import (
	"fmt"
	"time"
)

// Date is a calendar day (no time of day), written YYYY-MM-DD.
type Date struct{ d time.Time } // always midnight UTC

const dateLayout = "2006-01-02"

// ParseDate accepts a day between 2000-01-01 and 2100-12-31.
func ParseDate(s string) (Date, error) {
	t, err := time.Parse(dateLayout, s)
	if err != nil || t.Year() < 2000 || t.Year() > 2100 {
		return Date{}, fmt.Errorf("invalid date %q: want YYYY-MM-DD between 2000 and 2100", s)
	}
	return Date{t}, nil
}

func (d Date) String() string { return d.d.Format(dateLayout) }

// DateOf is the calendar day that t falls on in loc. br stores a due date at one
// time of day and bd at another, so the day is read in the user's zone.
func DateOf(t time.Time, loc *time.Location) Date {
	y, m, day := t.In(loc).Date()
	return Date{time.Date(y, m, day, 0, 0, 0, 0, time.UTC)}
}

// Days is a task length in whole days, 1 to 3650.
type Days struct{ n int }

func ParseDays(n int) (Days, error) {
	if n < 1 || n > 3650 {
		return Days{}, fmt.Errorf("days %d out of range 1..3650", n)
	}
	return Days{n}, nil
}

func (d Days) Int() int { return d.n }

// EstimateMinutes is the length in the unit br and bd store (minutes).
func (d Days) EstimateMinutes() int { return d.n * 24 * 60 }

// DaysOfMinutes rounds a stored estimate up to whole days, at least one.
func DaysOfMinutes(min int) Days {
	n := (min + 24*60 - 1) / (24 * 60)
	return Days{max(1, n)}
}

// When is a delivery time: a calendar day, or an exact minute. A day is what
// older beads have and what a person types; an exact minute is what an agent
// that finishes work in minutes needs.
type When struct {
	t       time.Time
	dayOnly bool
}

const minuteLayout = "2006-01-02T15:04:00Z"

// ParseWhen accepts YYYY-MM-DD or an RFC3339 time (any zone), between 2000 and
// 2100. A time is kept to the minute, in UTC. Other forms are rejected: bd reads
// "2026-11-20 14:30" as a wrong date without an error.
func ParseWhen(s string) (When, error) {
	if d, err := ParseDate(s); err == nil {
		return When{d.d, true}, nil
	}
	t, err := time.Parse(time.RFC3339, s)
	if err != nil || t.Year() < 2000 || t.Year() > 2100 {
		return When{}, fmt.Errorf("invalid time %q: want YYYY-MM-DD or RFC3339 like 2026-11-20T14:30:00Z", s)
	}
	return When{t.UTC().Truncate(time.Minute), false}, nil
}

// String is the form br and bd take on the command line.
func (w When) String() string {
	if w.dayOnly {
		return w.t.Format(dateLayout)
	}
	return w.t.Format(minuteLayout)
}

// Minutes is a task length in whole minutes, from 1 minute to a year.
type Minutes struct{ n int }

func ParseMinutes(n int) (Minutes, error) {
	if n < 1 || n > 525600 {
		return Minutes{}, fmt.Errorf("minutes %d out of range 1..525600", n)
	}
	return Minutes{n}, nil
}

func (m Minutes) Int() int { return m.n }
