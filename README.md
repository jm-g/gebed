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

It's keyboard first. `j` and `k` move, `gg` and `G` jump, `Enter` opens a bead. Press `SPC` and a little popup shows what each next key does, so you don't have to memorize anything. `?` lists them all.

`SPC v` changes the view: list, kanban, dependency graph or waterfall. `SPC e` edits the selected bead (status, priority, title, labels, links). `n` makes a new one.

Colors come from base16 and base24 schemes, `SPC t n` cycles them. Drop your own `.yaml` files in `~/.config/gebed/themes/`.

A bead can depend on a bead in another repo. Type `repo:id` when you link, and the graph shows it.

## Talking to agents

Every bead is a discussion. Comments are stored by `br`/`bd` in the repo, so when an agent runs `br comments add`, it shows up in the UI a couple of seconds later.

Write `@name` in a comment and gebed sends it to the running Claude Code session with that name, then tells you who got it. The agent answers in the same bead.

This only works on Linux for now, because that's where gebed can find live sessions.

## Claude Code

gebed has an MCP server that can do anything you can do in the browser, plus a skill that teaches an agent how to plan and land work across repos with it:

```console
$ claude mcp add gebed -- gebed mcp
$ gebed skill install
```

Keep `gebed` running while the agent works, the MCP tools talk to it.

## Build

You need Nix. Everything else (Go, Elm, `just`, `bd`) comes with the dev shell, and `br` should be on your PATH.

```console
$ nix develop
$ just build
$ just test
```

`nix build` gives you the binary directly. The compiled Elm bundle is committed, so after changing anything in `web/` run `just build` and commit `internal/server/static/app.js`. CI checks that it's up to date.

Releases ship static binaries for Linux and macOS, amd64 and arm64.
