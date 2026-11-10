// Package model holds the backend-independent bead types. Values are built by
// parse functions that reject invalid input, so a model value is always valid.
package model

import (
	"fmt"
	"time"
)

// ID is a non-empty bead id without whitespace (e.g. "br-aki").
type ID struct{ s string }

func ParseID(s string) (ID, error) {
	if !plain(s) {
		return ID{}, fmt.Errorf("invalid bead id %q", s)
	}
	return ID{s}, nil
}

func (i ID) String() string { return i.s }

// Status is a workflow status. br/bd accept custom statuses next to the known
// ones, so any non-empty string is valid; Known tells the two apart.
type Status struct{ s string }

var (
	Open       = Status{"open"}
	InProgress = Status{"in_progress"}
	Blocked    = Status{"blocked"}
	Deferred   = Status{"deferred"}
	Draft      = Status{"draft"}
	Closed     = Status{"closed"}
	Tombstone  = Status{"tombstone"}
	Pinned     = Status{"pinned"}
)

func ParseStatus(s string) (Status, error) {
	if !plain(s) {
		return Status{}, fmt.Errorf("invalid status %q", s)
	}
	return Status{s}, nil
}

func (s Status) String() string { return s.s }

// Kind is the issue type (task, bug, feature, epic, ...); custom kinds are valid.
type Kind struct{ s string }

var (
	Task     = Kind{"task"}
	Bug      = Kind{"bug"}
	Feature  = Kind{"feature"}
	Epic     = Kind{"epic"}
	Chore    = Kind{"chore"}
	Docs     = Kind{"docs"}
	Question = Kind{"question"}
)

func ParseKind(s string) (Kind, error) {
	if !plain(s) {
		return Kind{}, fmt.Errorf("invalid issue type %q", s)
	}
	return Kind{s}, nil
}

func (k Kind) String() string { return k.s }

// Priority is 0 (critical) to 4 (backlog).
type Priority struct{ n uint8 }

func ParsePriority(n int) (Priority, error) {
	if n < 0 || n > 4 {
		return Priority{}, fmt.Errorf("priority %d out of range 0..4", n)
	}
	return Priority{uint8(n)}, nil
}

func (p Priority) Int() int { return int(p.n) }

// DepType is a dependency edge type (blocks, parent-child, related, ...).
type DepType struct{ s string }

var (
	Blocks      = DepType{"blocks"}
	ParentChild = DepType{"parent-child"}
)

func ParseDepType(s string) (DepType, error) {
	if !plain(s) {
		return DepType{}, fmt.Errorf("invalid dependency type %q", s)
	}
	return DepType{s}, nil
}

func (d DepType) String() string { return d.s }

// Dep is an edge from the owning bead to On.
type Dep struct {
	On   ID
	Type DepType
}

// Bead is one issue. Empty text fields mean absent. Deps is filled only by
// Store.Get; List rows carry DepCount instead.
type Bead struct {
	ID             ID
	Title          string
	Description    string
	Design         string
	Acceptance     string
	Notes          string
	Status         Status
	Kind           Kind
	Priority       Priority
	Assignee       string
	Owner          string
	Labels         []string
	Created        time.Time
	Updated        time.Time
	Closed         *time.Time
	CloseReason    string
	DepCount       int
	DependentCount int
	Deps           []Dep
}
