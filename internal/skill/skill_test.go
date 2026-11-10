package skill

import (
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"

	"gebed/internal/mcp"
)

func TestInstall(t *testing.T) {
	dir := t.TempDir()
	p, err := Install(dir)
	if err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(p)
	if err != nil || !strings.HasPrefix(string(b), "---\nname: gebed-pm\n") {
		t.Fatalf("%v %q", err, b[:min(40, len(b))])
	}
	if _, err := Install(dir); err != nil { // installing again replaces the file
		t.Fatal(err)
	}
}

func TestInstallRefusesSymlink(t *testing.T) {
	dir := t.TempDir()
	target := filepath.Join(t.TempDir(), "elsewhere.md")
	if err := os.WriteFile(target, []byte("x"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(dir, Name), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Symlink(target, filepath.Join(dir, Name, "SKILL.md")); err != nil {
		t.Fatal(err)
	}
	if _, err := Install(dir); err == nil {
		t.Fatal("symlink replaced")
	}
	if b, _ := os.ReadFile(target); string(b) != "x" {
		t.Fatal("symlink target was written")
	}
}

// Every MCP tool must be explained in the skill, and the skill must not name a
// tool that does not exist.
func TestSkillNamesRealTools(t *testing.T) {
	b, err := files.ReadFile(Name + "/SKILL.md")
	if err != nil {
		t.Fatal(err)
	}
	for _, n := range mcp.ToolNames() {
		if !strings.Contains(string(b), "`"+n+"`") {
			t.Errorf("skill does not explain tool %s", n)
		}
	}
	for _, w := range strings.FieldsFunc(string(b), func(r rune) bool { return r != '_' && (r < 'a' || r > 'z') }) {
		if strings.HasPrefix(w, "gebed_") && !slices.Contains(mcp.ToolNames(), w) {
			t.Errorf("skill names a tool that does not exist: %s", w)
		}
	}
}
