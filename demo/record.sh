#!/bin/sh
# Records docs/demo.gif: seeds the demo projects, starts gebed with a few fake
# agent sessions, plays demo/record.mjs in headless Chromium, and encodes the GIF.
#
#   nix shell nixpkgs#libfaketime nixpkgs#ffmpeg nixpkgs#gifsicle -c demo/record.sh [OUT.gif]
#
# Run it from the repo root, inside `nix develop`. It never deletes anything: the
# work directory is new each time, under the system temp directory.
set -eu

OUT=${1:-docs/demo.gif}
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/.." && pwd)
WORK=$(mktemp -d)
PORT=${GEBED_DEMO_PORT:-7790}
CDP=${GEBED_DEMO_CDP:-9390}
PIDS=""

echo "work dir: $WORK"
go build -o "$WORK/gebed" "$ROOT/cmd/gebed"

sh "$HERE/seed.sh" "$WORK/projects"

# fake live agent sessions: a process that stays alive and a socket that listens
mkdir -p "$WORK/claude/sessions" "$WORK/run/cc-socks" "$WORK/config" "$WORK/frames"
for name in impl ux infra mobile docs qa; do
  sleep 1800 &
  pid=$!
  PIDS="$PIDS $pid"
  socat -u "UNIX-LISTEN:$WORK/run/cc-socks/$name.sock,fork" OPEN:/dev/null &
  PIDS="$PIDS $!"
  printf '{"pid":%s,"name":"%s","cwd":"/work/%s","status":"idle","messagingSocketPath":"%s/run/cc-socks/%s.sock"}\n' \
    "$pid" "$name" "$name" "$WORK" "$name" >"$WORK/claude/sessions/$pid.json"
done

XDG_RUNTIME_DIR="$WORK/run" XDG_CONFIG_HOME="$WORK/config" "$WORK/gebed" \
  -claude "$WORK/claude" -addr "127.0.0.1:$PORT" \
  "$WORK/projects/orbit" "$WORK/projects/orbit-infra" "$WORK/projects/orbit-web" >"$WORK/gebed.log" 2>&1 &
PIDS="$PIDS $!"

chromium --headless=new --no-sandbox --disable-gpu --hide-scrollbars \
  --user-data-dir="$WORK/chrome" --remote-debugging-port="$CDP" about:blank >"$WORK/chrome.log" 2>&1 &
PIDS="$PIDS $!"
sleep 3

# shellcheck disable=SC2064
trap "kill $PIDS 2>/dev/null || true" EXIT

node "$HERE/record.mjs" "$CDP" "$PORT" "$WORK/frames"

echo "encoding"
cd "$WORK/frames"
ffmpeg -loglevel error -y -f concat -i frames.txt -vf "fps=8,scale=1000:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" "$WORK/raw.gif"
gifsicle -O3 --lossy=70 "$WORK/raw.gif" -o "$ROOT/$OUT"
ls -l "$ROOT/$OUT"
