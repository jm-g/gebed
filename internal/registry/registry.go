// Package registry keeps the list of repos gebed shows, persisted as JSON.
package registry

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"slices"
	"strings"
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

// expandHome replaces a leading "~" or "~/" with the home directory.
// Other forms, such as "~user", are returned unchanged.
func expandHome(dir string) (string, error) {
	rest, ok := strings.CutPrefix(dir, "~")
	if !ok || (rest != "" && rest[0] != '/') {
		return dir, nil
	}
	home, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(home, rest), nil
}

// ParseLine splits a "name:path" line. The name is optional: the part before the
// first colon names the repo when it has no slash, otherwise the whole line is a path.
func ParseLine(line string) (name, dir string) {
	if n, p, ok := strings.Cut(line, ":"); ok && strings.TrimSpace(n) != "" && !strings.Contains(n, "/") {
		return strings.TrimSpace(n), strings.TrimSpace(p)
	}
	return "", strings.TrimSpace(line)
}

// Add registers the repo at dir under its base name. dir must hold a .beads directory,
// and the name must be new. Adding the same dir twice is a no-op.
func (r *Registry) Add(dir string) (Repo, error) {
	return r.AddNamed("", dir)
}

// AddNamed is Add with an explicit name; an empty name means the base name of dir.
func (r *Registry) AddNamed(name, dir string) (Repo, error) {
	if dir == "" {
		return Repo{}, errors.New("no path given")
	}
	dir, err := expandHome(dir)
	if err != nil {
		return Repo{}, err
	}
	abs, err := filepath.Abs(dir)
	if err != nil {
		return Repo{}, err
	}
	if _, err := store.Detect(abs); err != nil {
		return Repo{}, err
	}
	if name == "" {
		name = filepath.Base(abs)
	}
	repo := Repo{Name: name, Dir: abs}
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

// Remove unregisters the repo called name. Its directory is not touched.
func (r *Registry) Remove(name string) (Repo, error) {
	r.mu.Lock()
	defer r.mu.Unlock()
	i := slices.IndexFunc(r.repos, func(x Repo) bool { return x.Name == name })
	if i < 0 {
		return Repo{}, fmt.Errorf("unknown repo %q", name)
	}
	gone := r.repos[i]
	r.repos = slices.Delete(r.repos, i, i+1)
	return gone, r.save()
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
