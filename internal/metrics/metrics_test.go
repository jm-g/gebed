package metrics

import (
	"math"
	"testing"
	"time"

	"gebed/internal/model"
)

var now = time.Date(2026, 11, 11, 12, 0, 0, 0, time.UTC) // a Wednesday

func bead(id string, status model.Status, labels []string, est int, created time.Time, closed *time.Time, updated time.Time) model.Bead {
	i, _ := model.ParseID(id)
	return model.Bead{ID: i, Title: id, Status: status, Labels: labels, EstimateMin: est, Created: created, Closed: closed, Updated: updated}
}

func rep(agent, outcome string, weight, complexity, minutes, attempts, tokens, cents, pass, fail, capacity, conf int, findings string, at time.Time) Stamped {
	r, err := model.NewReport(agent, outcome, weight, complexity, minutes, attempts, tokens, cents, pass, fail, capacity, conf, findings)
	if err != nil {
		panic(err)
	}
	return Stamped{r, at}
}

func near(t *testing.T, name string, got *float64, want float64) {
	t.Helper()
	if got == nil || math.Abs(*got-want) > 0.01 {
		t.Errorf("%s = %v, want %v", name, got, want)
	}
}

func day(d int) time.Time { return now.AddDate(0, 0, d) }

func fixture() []Item {
	c1, c2 := day(-1), day(-8) // closed this week and last week
	return []Item{
		// 5 points, estimated 60 min, took 90 (underestimate), one retry, success
		{bead("a", model.Closed, []string{"weight:5"}, 60, day(-10), &c1, c1), []Stamped{rep("impl", "success", 0, 3, 90, 2, 100000, 50, 8, 2, 3, 90, "found a race", day(-1))}},
		// 3 points, estimated 30 min, took 30, success
		{bead("b", model.Closed, []string{"weight:3"}, 30, day(-12), &c2, c2), []Stamped{rep("impl", "success", 0, 2, 30, 1, 40000, 20, 5, 0, 3, 0, "", day(-8))}},
		// 8 points in progress, a failed first report
		{bead("c", model.InProgress, []string{"weight:8"}, 0, day(-3), nil, day(-2)), []Stamped{rep("ux", "failure", 0, 5, 0, 1, 0, 0, 0, 0, 2, 40, "", day(-2))}},
		// open, 2 points
		{bead("d", model.Open, []string{"weight:2"}, 0, day(-1), nil, day(-1)), nil},
		{bead("e", model.Blocked, nil, 0, day(-1), nil, day(-1)), nil},
	}
}

func TestVelocityAndForecast(t *testing.T) {
	m := Compute(now, time.UTC, fixture())
	if m.PointsTotal != 18 || m.PointsDone != 8 || m.PointsRemaining != 10 || m.Weighed != 4 {
		t.Fatalf("points: %+v", m)
	}
	if len(m.Velocity) != 8 || m.Velocity[7].Points != 5 || m.Velocity[6].Points != 3 {
		t.Fatalf("velocity: %+v", m.Velocity)
	}
	near(t, "avg velocity (last 4 weeks)", m.AvgVelocity, 2.0)
	near(t, "forecast weeks", m.ForecastWeeks, 5.0) // 10 points at 2 per week
}

func TestOutcomesAndRework(t *testing.T) {
	m := Compute(now, time.UTC, fixture())
	if m.Reports != 3 || m.Outcomes["success"] != 2 || m.Outcomes["failure"] != 1 {
		t.Fatalf("%+v", m.Outcomes)
	}
	near(t, "success rate", m.SuccessRate, 66.67)
	near(t, "rework rate", m.ReworkRate, 33.33) // one of three reports had a retry
	near(t, "test pass", m.TestPassPct, 13.0/15*100)
	if m.Findings != 1 || m.LowConfid != 1 {
		t.Errorf("findings=%d lowConfid=%d", m.Findings, m.LowConfid)
	}
}

func TestEstimateAccuracy(t *testing.T) {
	m := Compute(now, time.UTC, fixture())
	if m.EstimateSamples != 2 {
		t.Fatalf("samples %d", m.EstimateSamples)
	}
	near(t, "MAPE", m.EstimateMAPE, 25) // |+50%| and |0%|
	near(t, "bias", m.EstimateBias, 25) // took longer on average
	near(t, "minutes per point", m.MinutesPerPoint, 120.0/8)
	near(t, "tokens per point", m.TokensPerPoint, 140000.0/8)
}

func TestCapacityUsesTheLatestReportOfEachAgent(t *testing.T) {
	m := Compute(now, time.UTC, fixture())
	if m.Capacity != 5 || len(m.Agents) != 2 || m.Agents[0].Agent != "impl" || m.Agents[0].Capacity != 3 {
		t.Fatalf("%+v", m.Agents)
	}
	near(t, "utilization", m.Utilization, 20) // 1 in progress of capacity 5
}

func TestAgingAndWIP(t *testing.T) {
	m := Compute(now, time.UTC, fixture())
	if m.WIP != 1 || m.Blocked != 1 || len(m.Aging) != 1 || m.Aging[0].ID != "c" || m.Aging[0].Hours < 47 {
		t.Fatalf("wip=%d blocked=%d aging=%+v", m.WIP, m.Blocked, m.Aging)
	}
}

func TestComplexityAndWeightLevels(t *testing.T) {
	m := Compute(now, time.UTC, fixture())
	want := map[int][2]int{2: {1, 1}, 3: {1, 1}, 5: {1, 0}} // level: beads, success
	if len(m.Complexity) != 3 {
		t.Fatalf("%+v", m.Complexity)
	}
	for _, l := range m.Complexity {
		if w := want[l.Level]; l.Beads != w[0] || l.Success != w[1] {
			t.Errorf("level %d: %+v", l.Level, l)
		}
	}
	if len(m.Weights) != 4 || m.Weights[0].Level != 2 {
		t.Errorf("weights %+v", m.Weights)
	}
}

func TestNothingMeasuredMeansNothingShown(t *testing.T) {
	m := Compute(now, time.UTC, []Item{{Bead: bead("x", model.Open, nil, 0, day(-1), nil, day(-1))}})
	if m.SuccessRate != nil || m.AvgVelocity != nil || m.ForecastWeeks != nil || m.EstimateMAPE != nil || m.Utilization != nil || m.MinutesPerPoint != nil {
		t.Fatalf("a missing measurement must be nil, not zero: %+v", m)
	}
}

func TestAWeekStartsOnMonday(t *testing.T) {
	m := Compute(now, time.UTC, nil)
	if m.Velocity[7].Start != "2026-11-09" || m.Velocity[0].Start != "2026-09-21" {
		t.Errorf("%s .. %s", m.Velocity[0].Start, m.Velocity[7].Start)
	}
}

func TestAPlannerWeightBeatsAnAgentsAndOneIsUsedWhenThereIsNone(t *testing.T) {
	c := day(-1)
	items := []Item{
		{bead("p", model.Closed, []string{"weight:3"}, 0, day(-2), &c, c), []Stamped{rep("a", "success", 13, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", c)}},
		{bead("q", model.Closed, nil, 0, day(-2), &c, c), []Stamped{rep("a", "success", 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", c)}},
	}
	if m := Compute(now, time.UTC, items); m.PointsDone != 11 {
		t.Errorf("points done %d, want 3 + 8", m.PointsDone)
	}
}
