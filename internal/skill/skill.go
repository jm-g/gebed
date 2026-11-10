// Package skill ships the Claude Code skill that lets an agent act as project
// manager over gebed.
package skill

import (
	"embed"
	"fmt"
	"os"
	"path/filepath"
)

//go:embed gebed-pm/SKILL.md
var files embed.FS

// Name is the skill directory name.
const Name = "gebed-pm"

// Install writes the skill to <skillsDir>/gebed-pm/SKILL.md and returns that
// path. It fails when skillsDir is read-only (for example a directory the
// system manages), and it never replaces a symlink.
func Install(skillsDir string) (string, error) {
	b, err := files.ReadFile(Name + "/SKILL.md")
	if err != nil {
		return "", err
	}
	dir := filepath.Join(skillsDir, Name)
	dst := filepath.Join(dir, "SKILL.md")
	if fi, err := os.Lstat(dst); err == nil && fi.Mode()&os.ModeSymlink != 0 {
		return "", fmt.Errorf("%s is a symlink; remove it first or install elsewhere", dst)
	}
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return "", err
	}
	tmp := dst + ".tmp"
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return "", err
	}
	return dst, os.Rename(tmp, dst)
}
