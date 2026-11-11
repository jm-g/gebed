# gebed

gebed is a small web app for your beads. If you track work with `br` or `bd` in a few different repos, gebed puts all of it in one browser tab: you can see it, edit it, and talk about it there.

It is one Go binary with the UI inside. It doesn't care if a repo uses `br` (sqlite and jsonl) or `bd` (dolt), they look and work the same. gebed never opens those databases itself, it just runs `br` and `bd` and reads what they print.

## Try it

Grab a binary from the releases page, or build it (see below), then point it at repos that have a `.beads` folder:

```console
$ gebed ~/code/one ~/code/two
gebed on http://127.0.0.1:7878
```

It remembers the repos you gave it. Open the address and you're in.

## Moving around

It opens on a kanban board. It's keyboard first, like vim: `h` `j` `k` `l` move between and inside the columns, and the bar at the top always shows the mode (`-NORMAL-`), a few numbers about the view, and the keys that matter right now.

The capital letters move things. `H` and `L` move the selected card to the column on its left or right, and `J` and `K` lower or raise its priority. `Enter` opens the bead's discussion, `c` comments, `a` asks the agent, `n` makes a new bead. `SPC` opens a little popup that shows what each next key does, and `?` lists them all.

`SPC v` changes the view and `Tab` cycles through them: kanban, list, epics, story map, roadmap, iterations, waterfall, dependency graph, flow metrics (burnup, throughput, lead time) and an impact/effort matrix. `SPC e` edits the rest (title, labels, links, epic). `gt` and `gT` (or `Tab`) step through the views, which are also tabs in the second bar at the top with their counts. `[r` and `]r` switch repos, `[[` and `]]` jump between sections (columns, epics, groups), `{` and `}` to the start and end of the section, and `zt` `zz` `zb` put the selection at the top, middle or bottom, like vim; every motion scrolls to keep the selection in view. `SPC` then Backspace lists every key.

`f` finds beads with fuzzy matching and `s` searches exactly, across all your repos: ids, titles, text, comments, labels, epics and dates. An epic is a bead of kind `epic`; the beads in it carry its name as a tag.

The waterfall has a time ruler. Each task has a delivery date and a length, so its bar starts that many days earlier. Drag a bar, or press `H` and `L`, to move it a day at a time, and press `<` and `>` to shorten or extend it. The dates are saved in the bead (`due` and the estimate), so `br` and `bd` see them too.

Agents finish work in minutes, so the waterfall zooms: `+` and `-` go from one day per cell down to 6 hours, an hour, 15 and 5 minutes. At each zoom `H` and `L` slide a task by one cell and `<` and `>` shorten or extend it by one cell. Times are stored to the minute in the bead (`due` and the estimate).

Colors come from base16 and base24 schemes, `SPC t n` cycles them. Drop your own `.yaml` files in `~/.config/gebed/themes/`.

A bead can depend on a bead in another repo. Type `repo:id` when you link, and the graph shows it.

## Talking to agents

Every bead is a discussion. Comments are stored by `br`/`bd` in the repo, so when an agent runs `br comments add`, it shows up in the UI a couple of seconds later.

Write `@name` in a comment and gebed sends it to the running Claude Code session with that name, then tells you who got it. The agent answers in the same bead.

Claude Code integration only works on Linux for now, because that's where gebed can find live sessions.

## Claude Code

gebed has an MCP server that can do anything you can do in the browser, plus a skill that teaches an agent how to plan and land work across repos with it:

```console
$ claude mcp add gebed -- gebed mcp
$ gebed skill install
```

Keep `gebed` running while the agent works, the MCP tools talk to it. Ask your agents to load gebed SKILL.

## Build

You need Nix. Everything else (Go, Elm, `just`, `bd`) comes with the dev shell, and `br` should be on your PATH.

```console
$ nix develop
$ just build
$ just test
```

`nix build` gives you the binary directly. The compiled Elm bundle is committed, so after changing anything in `web/` run `just build` and commit `internal/server/static/app.js`. CI checks that it's up to date.

Releases ship static binaries for Linux and macOS, amd64 and arm64.
