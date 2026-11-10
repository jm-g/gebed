package model

import (
	"fmt"
	"strings"
)

// Ref points at a bead. Project is empty for a bead of the same repo; for a
// cross-repo link it names the other repo, as br and bd store it:
// "external:<project>:<id>".
type Ref struct {
	Project string
	ID      ID
}

const externalPrefix = "external:"

func ParseRef(s string) (Ref, error) {
	rest, ok := strings.CutPrefix(s, externalPrefix)
	if !ok {
		id, err := ParseID(s)
		return Ref{ID: id}, err
	}
	proj, id, ok := strings.Cut(rest, ":")
	if !ok || !plain(proj) {
		return Ref{}, fmt.Errorf("bad external ref %q: want external:<project>:<id>", s)
	}
	bid, err := ParseID(id)
	if err != nil {
		return Ref{}, fmt.Errorf("bad external ref %q: %w", s, err)
	}
	return Ref{Project: proj, ID: bid}, nil
}

// String is the form br and bd take on the command line.
func (r Ref) String() string {
	if r.Project == "" {
		return r.ID.String()
	}
	return externalPrefix + r.Project + ":" + r.ID.String()
}

// Edge says From depends on To.
type Edge struct {
	From ID
	To   Ref
	Type DepType
}
