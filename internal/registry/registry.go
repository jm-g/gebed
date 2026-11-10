// Package registry keeps the list of repos gebed shows, persisted as JSON.
package registry

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"sync"

	"gebed/internal/store"
)

// Repo is a registered repo: a unique Name and the absolute Dir holding .beads.
type Repo struct {
	Name string `json:"name"`
	Dir  string `json:"dir"`
}

// Registry is safe for concurrent use.
type Registry struct {
	mu    sync.Mutex
	path  string
	repos []Repo
}

// Load reads the registry at path; a missing file is an empty registry.
func Load(path string) (*Registry, error) {
	r := &Registry{path: path}
	b, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return r, nil
	}
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal(b, &r.repos); err != nil {
		return nil, fmt.Errorf("registry %s: %w", path, err)
	}
	return r, nil
}

func (r *Registry) List() []Repo {
	r.mu.Lock()
	defer r.mu.Unlock()
	return slices.Clone(r.repos)
}

func (r *Registry) Find(name string) (Repo, bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, x := range r.repos {
		if x.Name == name {
			return x, true
		}
	}
	return Repo{}, false
}

// Add registers the repo at dir. dir must hold a .beads directory; its base
// name becomes the repo name and must be new. Adding the same dir twice is a no-op.
func (r *Registry) Add(dir string) (Repo, error) {
	abs, err := filepath.Abs(dir)
	if err != nil {
		return Repo{}, err
	}
	if _, err := store.Detect(abs); err != nil {
		return Repo{}, err
	}
	repo := Repo{Name: filepath.Base(abs), Dir: abs}
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, x := range r.repos {
		if x.Dir == abs {
			return x, nil
		}
		if x.Name == repo.Name {
			return Repo{}, fmt.Errorf("repo name %q already used by %s", x.Name, x.Dir)
		}
	}
	r.repos = append(r.repos, repo)
	return repo, r.save()
}

func (r *Registry) save() error {
	b, err := json.MarshalIndent(r.repos, "", "  ")
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(r.path), 0o755); err != nil {
		return err
	}
	tmp := r.path + ".tmp"
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, r.path)
}
