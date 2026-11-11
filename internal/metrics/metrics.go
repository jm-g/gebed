// Package metrics turns beads and the reports agents attach to them into the
// numbers of agile and kanban flow: velocity, forecast, success and rework rate,
// estimate accuracy, capacity, aging work in progress and cost per point.
// Everything here is a pure function of its input, so it is tested without a CLI.
package metrics

import (
	"math"
	"sort"
	"time"

	"gebed/internal/model"
)

// Stamped is a report with the time it was written.
type Stamped struct {
	model.Report
	At time.Time
}

// Item is a bead with all its reports, oldest first.
type Item struct {
	Bead    model.Bead
	Reports []Stamped
}

type Week struct {
	Start  string `json:"start"` // Monday, YYYY-MM-DD
	Points int    `json:"points"`
	Closed int    `json:"closed"`
}

type Aged struct {
	ID    string  `json:"id"`
	Title string  `json:"title"`
	Hours float64 `json:"hours"` // since the last update
}

type AgentCap struct {
	Agent    string `json:"agent"`
	Capacity int    `json:"capacity"`
}

type Level struct {
	Level   int `json:"level"`
	Beads   int `json:"beads"`
	Success int `json:"success"` // beads whose latest report is a success
}

// Metrics are all measured values. A pointer is nil when there is nothing to
// measure it from, so a missing value is never shown as zero.
type Metrics struct {
	Beads  int `json:"beads"`
	Closed int `json:"closed"`
	WIP    int `json:"wip"`
	// Blocked beads are counted apart from WIP.
	Blocked int `json:"blocked"`

	PointsTotal     int `json:"pointsTotal"`
	PointsDone      int `json:"pointsDone"`
	PointsRemaining int `json:"pointsRemaining"`
	Weighed         int `json:"weighed"` // beads that have a weight

	Velocity    []Week   `json:"velocity"`              // last 8 weeks, oldest first
	AvgVelocity *float64 `json:"avgVelocity,omitempty"` // points per week, last 4 weeks
	// ForecastWeeks is the points still to do divided by the average velocity.
	ForecastWeeks *float64 `json:"forecastWeeks,omitempty"`

	Reports     int            `json:"reports"`
	Outcomes    map[string]int `json:"outcomes"`
	SuccessRate *float64       `json:"successRate,omitempty"` // success / all reports
	ReworkRate  *float64       `json:"reworkRate,omitempty"`  // share of reports with more than one attempt
	TestPassPct *float64       `json:"testPassPct,omitempty"`

	EstimateSamples int      `json:"estimateSamples"`
	EstimateMAPE    *float64 `json:"estimateMape,omitempty"` // mean absolute error, percent of the estimate
	EstimateBias    *float64 `json:"estimateBias,omitempty"` // percent; positive means the work took longer

	MinutesPerPoint   *float64 `json:"minutesPerPoint,omitempty"`
	TokensPerPoint    *float64 `json:"tokensPerPoint,omitempty"`
	CostCentsPerPoint *float64 `json:"costCentsPerPoint,omitempty"`
	FlowEfficiency    *float64 `json:"flowEfficiency,omitempty"` // working minutes / lead minutes, percent

	Agents      []AgentCap `json:"agents"`
	Capacity    int        `json:"capacity"`
	Utilization *float64   `json:"utilization,omitempty"` // WIP / capacity, percent

	Aging       []Aged  `json:"aging"`
	Weights     []Level `json:"weights"`
	Complexity  []Level `json:"complexity"`
	Findings    int     `json:"findings"`    // reports that carry free-text findings
	LowConfid   int     `json:"lowConfid"`   // reports under 60 percent confidence
	LeadMedianH float64 `json:"leadMedianH"` // hours from created to closed, closed beads
}

func ptr(f float64) *float64 { return &f }

func mondayOf(t time.Time, loc *time.Location) time.Time {
	y, m, d := t.In(loc).Date()
	day := time.Date(y, m, d, 0, 0, 0, 0, time.UTC)
	back := (int(day.Weekday()) + 6) % 7 // days since Monday
	return day.AddDate(0, 0, -back)
}

// weightOf is the points a bead is worth: the planner's weight label, or else
// the latest weight an agent reported.
func weightOf(it Item) int {
	if w := model.LabelInt(it.Bead.Labels, "weight"); w > 0 {
		return w
	}
	for i := len(it.Reports) - 1; i >= 0; i-- {
		if it.Reports[i].Weight > 0 {
			return it.Reports[i].Weight
		}
	}
	return 0
}

func complexityOf(it Item) int {
	for i := len(it.Reports) - 1; i >= 0; i-- {
		if it.Reports[i].Complexity > 0 {
			return it.Reports[i].Complexity
		}
	}
	return model.LabelInt(it.Bead.Labels, "complexity")
}

// Compute measures a repo's beads at time now. loc is the user's zone, which
// decides where a week starts.
func Compute(now time.Time, loc *time.Location, items []Item) Metrics {
	m := Metrics{Outcomes: map[string]int{}, Beads: len(items), Agents: []AgentCap{}, Aging: []Aged{}}
	week0 := mondayOf(now, loc)
	weeks := make([]Week, 8)
	for i := range weeks {
		weeks[i].Start = week0.AddDate(0, 0, -7*(7-i)).Format("2006-01-02")
	}
	weekIdx := func(t time.Time) int { // index into weeks, -1 when outside the last eight
		d := int(week0.Sub(mondayOf(t, loc)).Hours() / 24 / 7)
		if d < 0 || d > 7 {
			return -1
		}
		return 7 - d
	}

	var (
		lead                                  []float64
		estN                                  int
		absErr, signedErr                     float64
		pointMin, pointTok, pointCost, pointW float64
		minPoints                             float64
		leadSum, workSum                      float64
		attemptsN, reworkN, testsPass, testsN int
		success                               int
		cap                                   = map[string]int{}
		capAt                                 = map[string]time.Time{}
		wLevels                               = map[int]*Level{}
		cLevels                               = map[int]*Level{}
	)
	for _, it := range items {
		b := it.Bead
		w := weightOf(it)
		if w > 0 {
			m.Weighed++
			m.PointsTotal += w
		}
		closed := b.Status == model.Closed
		switch {
		case closed:
			m.Closed++
			if w > 0 {
				m.PointsDone += w
			}
			if b.Closed != nil {
				if i := weekIdx(*b.Closed); i >= 0 {
					weeks[i].Closed++
					weeks[i].Points += w
				}
				lead = append(lead, b.Closed.Sub(b.Created).Hours())
			}
		case b.Status == model.Blocked:
			m.Blocked++
		case b.Status == model.InProgress:
			m.WIP++
			m.Aging = append(m.Aging, Aged{b.ID.String(), b.Title, math.Max(0, now.Sub(b.Updated).Hours())})
		}

		minutes, tokens, cost := 0, 0, 0
		for _, r := range it.Reports {
			m.Reports++
			m.Outcomes[r.Outcome.String()]++
			if r.Outcome == model.Success {
				success++
			}
			if r.Attempts > 0 {
				attemptsN++
				if r.Attempts > 1 {
					reworkN++
				}
			}
			if r.TestsPass+r.TestsFail > 0 {
				testsN += r.TestsPass + r.TestsFail
				testsPass += r.TestsPass
			}
			if r.Findings != "" {
				m.Findings++
			}
			if r.Confidence > 0 && r.Confidence < 60 {
				m.LowConfid++
			}
			if r.Agent != "" && r.Capacity > 0 && !r.At.Before(capAt[r.Agent]) {
				cap[r.Agent], capAt[r.Agent] = r.Capacity, r.At
			}
			minutes += r.Minutes
			tokens += r.Tokens
			cost += r.CostCents
		}
		if w > 0 {
			l := wLevels[w]
			if l == nil {
				l = &Level{Level: w}
				wLevels[w] = l
			}
			l.Beads++
			if latestIs(it, model.Success) {
				l.Success++
			}
			if minutes > 0 {
				pointMin += float64(minutes)
				minPoints += float64(w)
			}
			if tokens > 0 {
				pointTok += float64(tokens)
				pointW += float64(w)
			}
			if cost > 0 {
				pointCost += float64(cost)
			}
		}
		if c := complexityOf(it); c > 0 {
			l := cLevels[c]
			if l == nil {
				l = &Level{Level: c}
				cLevels[c] = l
			}
			l.Beads++
			if latestIs(it, model.Success) {
				l.Success++
			}
		}
		if b.EstimateMin > 0 && minutes > 0 {
			e := float64(minutes-b.EstimateMin) / float64(b.EstimateMin)
			estN++
			absErr += math.Abs(e)
			signedErr += e
		}
		if closed && b.Closed != nil && minutes > 0 {
			leadSum += b.Closed.Sub(b.Created).Minutes()
			workSum += float64(minutes)
		}
	}

	m.Velocity = weeks
	m.PointsRemaining = m.PointsTotal - m.PointsDone
	sum, n := 0, 0
	for _, wk := range weeks[4:] {
		sum += wk.Points
		n++
	}
	if m.Weighed > 0 {
		avg := float64(sum) / float64(n)
		m.AvgVelocity = ptr(avg)
		if avg > 0 && m.PointsRemaining > 0 {
			m.ForecastWeeks = ptr(float64(m.PointsRemaining) / avg)
		}
	}
	if m.Reports > 0 {
		m.SuccessRate = ptr(100 * float64(success) / float64(m.Reports))
	}
	if attemptsN > 0 {
		m.ReworkRate = ptr(100 * float64(reworkN) / float64(attemptsN))
	}
	if testsN > 0 {
		m.TestPassPct = ptr(100 * float64(testsPass) / float64(testsN))
	}
	m.EstimateSamples = estN
	if estN > 0 {
		m.EstimateMAPE = ptr(100 * absErr / float64(estN))
		m.EstimateBias = ptr(100 * signedErr / float64(estN))
	}
	if minPoints > 0 {
		m.MinutesPerPoint = ptr(pointMin / minPoints)
	}
	if pointW > 0 {
		m.TokensPerPoint = ptr(pointTok / pointW)
		m.CostCentsPerPoint = ptr(pointCost / pointW)
	}
	if leadSum > 0 {
		m.FlowEfficiency = ptr(math.Min(100, 100*workSum/leadSum))
	}
	for a, c := range cap {
		m.Agents = append(m.Agents, AgentCap{a, c})
		m.Capacity += c
	}
	sort.Slice(m.Agents, func(i, j int) bool { return m.Agents[i].Agent < m.Agents[j].Agent })
	if m.Capacity > 0 {
		m.Utilization = ptr(100 * float64(m.WIP) / float64(m.Capacity))
	}
	sort.Slice(m.Aging, func(i, j int) bool { return m.Aging[i].Hours > m.Aging[j].Hours })
	if len(m.Aging) > 5 {
		m.Aging = m.Aging[:5]
	}
	m.Weights = levels(wLevels)
	m.Complexity = levels(cLevels)
	if len(lead) > 0 {
		sort.Float64s(lead)
		m.LeadMedianH = lead[len(lead)/2]
	}
	return m
}

func latestIs(it Item, o model.Outcome) bool {
	return len(it.Reports) > 0 && it.Reports[len(it.Reports)-1].Outcome == o
}

func levels(m map[int]*Level) []Level {
	out := []Level{}
	for _, l := range m {
		out = append(out, *l)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Level < out[j].Level })
	return out
}
