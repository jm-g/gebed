package store

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"gebed/internal/model"
)

// Store reads one repo's beads. Every implementation shells out to the `br` or
// `bd` CLI; gebed never opens sqlite or dolt files itself.
type Store interface {
	List(ctx context.Context) ([]model.Bead, error)
	Get(ctx context.Context, id model.ID) (model.Bead, error)
}

// Runner runs bin with args in dir and returns stdout.
type Runner func(ctx context.Context, dir, bin string, args ...string) ([]byte, error)

const execTimeout = 15 * time.Second

// Exec is the Runner that starts a real process, bounded by execTimeout.
func Exec(ctx context.Context, dir, bin string, args ...string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(ctx, execTimeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, bin, args...)
	cmd.Dir = dir
	var out, errb bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errb
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("%s %v in %s: %w: %s", bin, args, dir, err, bytes.TrimSpace(errb.Bytes()))
	}
	return out.Bytes(), nil
}

// Backend is the CLI that owns a repo's .beads directory.
type Backend struct {
	bin  string
	list func([]byte) ([]model.Bead, error)
	args []string
}

var (
	Br = Backend{"br", DecodeBrList, []string{"list", "--json", "--all"}}
	Bd = Backend{"bd", DecodeBdList, []string{"list", "--json", "--all", "--limit", "0"}}
)

func (b Backend) String() string { return b.bin }

// ErrNoBeads means dir holds no .beads directory.
var ErrNoBeads = errors.New("no .beads directory")

// Detect picks the backend of the repo at dir: a dolt directory under .beads
// means bd, anything else means br (sqlite or jsonl).
func Detect(dir string) (Backend, error) {
	bd := filepath.Join(dir, ".beads")
	if fi, err := os.Stat(bd); err != nil || !fi.IsDir() {
		return Backend{}, fmt.Errorf("%s: %w", dir, ErrNoBeads)
	}
	for _, n := range []string{"embeddeddolt", "doltdb", "dolt"} {
		if fi, err := os.Stat(filepath.Join(bd, n)); err == nil && fi.IsDir() {
			return Bd, nil
		}
	}
	return Br, nil
}

// CLI is a Store over one repo directory.
type CLI struct {
	Dir     string
	Backend Backend
	Run     Runner
}

// Open detects the backend of the repo at dir and returns its Store.
func Open(dir string, run Runner) (*CLI, error) {
	b, err := Detect(dir)
	if err != nil {
		return nil, err
	}
	return &CLI{Dir: dir, Backend: b, Run: run}, nil
}

func (c *CLI) List(ctx context.Context) ([]model.Bead, error) {
	raw, err := c.Run(ctx, c.Dir, c.Backend.bin, c.Backend.args...)
	if err != nil {
		return nil, err
	}
	return c.Backend.list(raw)
}

func (c *CLI) Get(ctx context.Context, id model.ID) (model.Bead, error) {
	raw, err := c.Run(ctx, c.Dir, c.Backend.bin, "show", id.String(), "--json")
	if err != nil {
		return model.Bead{}, err
	}
	return DecodeShow(raw)
}

// Comments returns a bead's discussion, oldest first as the CLI lists it.
func (c *CLI) Comments(ctx context.Context, id model.ID) ([]model.Comment, error) {
	raw, err := c.Run(ctx, c.Dir, c.Backend.bin, "comments", id.String(), "--json")
	if err != nil {
		return nil, err
	}
	return DecodeComments(raw)
}
