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
