# gebed

gebed is one Go binary with an Elm web UI. It shows and edits the beads of many repos in one place. It works with both `br` (beads-rust, sqlite and jsonl) and `bd` (beads, dolt). Every bead looks and behaves the same, whatever store holds it. gebed never opens a database itself: it runs `br` and `bd` and reads their JSON.

```sh
$ nix run github:vic/gebed -- ~/code/one ~/code/two
```

The paths on the command line are repos that hold a `.beads` directory. gebed remembers them. Open `http://127.0.0.1:7878`.

## Use

The UI is keyboard first. `j` and `k` move, `gg` and `G` jump, `Enter` opens a bead's discussion, and `SPC` opens a which-key popup that lists what each next key does. `SPC v` switches the view: list, kanban, dependency graph and waterfall. `SPC e` edits the selected bead: status, priority, title, labels and links. `SPC t n` cycles the color scheme. `?` shows the keys.

Schemes are tinted-theming base16 and base24 files. Put your own in `~/.config/gebed/themes/`.

A link to a bead of another repo is `repo:id`. `br` and `bd` store it as `external:repo:id`, and the graph shows it as a stub.

## Talk to agents

Each bead is a discussion. Comments live in the bead store, so an agent that runs `br comments add` shows up in the UI within seconds. Write `@name` in a comment and gebed sends it to the live Claude Code session with that name, using the same local sockets that Claude Code sessions use. The comment tells the agent to answer in the bead.

## Claude Code

gebed ships an MCP server that does everything the web UI does:

```sh
$ claude mcp add gebed -- gebed mcp
$ gebed skill install
```

The skill `gebed-pm` teaches an agent to plan, ask and land work across repos through those tools.

## Build

```sh
$ nix develop
$ just build        # elm bundle, then the Go binary in bin/
$ just test
$ just lint
$ just bundle-fresh # the committed bundle must match web/
```

The Elm bundle is committed at `internal/server/static/app.js` so that `nix build` needs no Elm toolchain.
