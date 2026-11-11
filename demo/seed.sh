#!/bin/sh
# Builds the demo projects for the README gif: a fictional team-chat product
# ("Orbit") with six epics, about sixty beads with weeks of history, plans down to
# the minute, discussions, agent reports and dependencies, plus a second br repo
# (infra) and a bd repo (web), so both backends show.
#
#   demo/seed.sh DIR        creates DIR/orbit, DIR/orbit-infra and DIR/orbit-web
#
# Needs br, bd, jq and faketime (history is written with a shifted clock).
set -eu

ROOT=${1:?usage: seed.sh DIR}
mkdir -p "$ROOT"
ROOT=$(cd "$ROOT" && pwd)
TMP=$(mktemp -d) # small, and left to the system temp cleaner

# at DAYS CMD...: run CMD with the clock DAYS days in the past.
at() {
  d=$1
  shift
  if [ "$d" -gt 0 ]; then faketime -f "-${d}d" "$@"; else "$@"; fi
}
day() { date -d "$1 days" +%F; }
mins() { date -u -d "+$1 min" +%Y-%m-%dT%H:%M:00Z; }

agent_of() { # labels -> the agent that does that kind of work
  case $1 in
    *mobile*) echo mobile ;;
    *infra*) echo infra ;;
    *frontend*) echo ux ;;
    *docs*) echo docs ;;
    *) echo impl ;;
  esac
}
capacity_of() {
  case $1 in
    impl) echo 3 ;; ux) echo 2 ;; infra) echo 2 ;; mobile) echo 2 ;; docs) echo 4 ;; *) echo 2 ;;
  esac
}

# report ID AGENT OUTCOME WEIGHT CX MINUTES ATTEMPTS TESTS_PASS TESTS_FAIL CONF DAYS_AGO FINDINGS
report() {
  id=$1 ag=$2 out=$3 w=$4 cx=$5 min=$6 att=$7 tp=$8 tf=$9
  shift 9
  conf=$1 ago=$2 findings=$3
  tokens=$((min * 900))
  cents=$((tokens / 1500))
  cap=$(capacity_of "$ag")
  json=$(printf '{"agent":"%s","outcome":"%s","weight":%s,"complexity":%s,"minutes":%s,"attempts":%s,"tokens":%s,"costCents":%s,"testsPass":%s,"testsFail":%s,"capacity":%s,"confidence":%s}' \
    "$ag" "$out" "$w" "$cx" "$min" "$att" "$tokens" "$cents" "$tp" "$tf" "$cap" "$conf")
  text=$(printf 'report: %s\n%s' "$json" "$findings")
  at "$ago" br comments add "$id" --author="$ag" --json -- "$text" >/dev/null
}

# ---------------------------------------------------------------- infra repo
INFRA=$ROOT/orbit-infra
mkdir -p "$INFRA"
(
  cd "$INFRA"
  br init --prefix infra >/dev/null 2>&1
  i=0
  while IFS='|' read -r key kind prio status ago closed title; do
    [ -z "$key" ] && continue
    i=$((i + 1))
    id=$(at "$ago" br create "$title" -t "$kind" -p "$prio" --json | jq -r .id)
    echo "$id" >"$TMP/infra-$key"
    w=$((i % 5 + 2))
    at "$ago" br update "$id" --add-label=infra --add-label="weight:$w" --json >/dev/null
    case $status in
      closed) at "$closed" br close "$id" --reason "shipped and verified" --json >/dev/null ;;
      in_progress) at 2 br update "$id" -s in_progress --due="$(day $((i % 6 + 2)))" --estimate=$((w * 240)) --json >/dev/null ;;
      blocked) at 3 br update "$id" -s blocked --json >/dev/null ;;
      open) br update "$id" --due="$(day $((i + 4)))" --estimate=$((w * 180)) --json >/dev/null ;;
    esac
  done <<'EOF'
pg|task|1|in_progress|12|0|Upgrade Postgres to 16
tf|feature|1|closed|30|20|Terraform the staging environment
redis|feature|2|closed|26|18|Redis cluster for sessions
obs|feature|2|open|6|0|Observability dashboards for message latency
cdn|feature|2|open|5|0|CDN for file uploads
sec|task|1|blocked|9|0|Rotate production secrets
os|task|1|in_progress|8|0|Resize the OpenSearch cluster
bg|feature|2|open|4|0|Blue/green deploys
bk|task|3|closed|22|14|Nightly database backups
EOF
  br comments add "$(cat "$TMP/infra-pg")" --author=infra --json -- "report: {\"agent\":\"infra\",\"outcome\":\"partial\",\"weight\":5,\"complexity\":4,\"minutes\":140,\"attempts\":1,\"testsPass\":18,\"testsFail\":1,\"capacity\":2,\"confidence\":70}
Replica upgraded. The primary needs a maintenance window: about 15 minutes of write downtime." --json >/dev/null
)

# ------------------------------------------------------------------- web (bd)
WEB=$ROOT/orbit-web
mkdir -p "$WEB"
(
  cd "$WEB"
  git init -q . 2>/dev/null || true
  BD_NON_INTERACTIVE=1 bd init -p web --non-interactive >/dev/null 2>&1
  for spec in \
    "Marketing site: pricing page|feature|2|open" \
    "Landing page hero animation|task|3|open" \
    "Accessibility audit of the web app|task|1|in_progress" \
    "Dark mode for the web app|feature|2|open" \
    "Fix layout shift on channel switch|bug|1|in_progress" \
    "Web app onboarding tour|feature|2|open" \
    "Keyboard shortcuts cheat sheet|feature|3|closed"; do
    title=${spec%%|*}
    rest=${spec#*|}
    kind=${rest%%|*}
    rest=${rest#*|}
    prio=${rest%%|*}
    status=${rest#*|}
    id=$(bd create "$title" -t "$kind" -p "$prio" --json | jq -r .id)
    bd update "$id" --add-label=frontend --estimate=$((prio * 120)) --due="$(day $((prio * 3 + 1)))" --json >/dev/null
    [ "$status" = in_progress ] && bd update "$id" -s in_progress --json >/dev/null
    [ "$status" = closed ] && bd close "$id" --reason "shipped" --json >/dev/null
  done
)

# ------------------------------------------------------------------ main repo
P=$ROOT/orbit
mkdir -p "$P"
cd "$P"
br init --prefix orbit >/dev/null 2>&1

mkepic() { # key title priority
  id=$(at 45 br create "$2" -t epic -p "$3" --json | jq -r .id)
  echo "$id" >"$TMP/epic-$1"
  br label add "$id" epic-root --json >/dev/null
}
mkepic auth "Auth and identity" 0
mkepic msg "Messaging core" 0
mkepic notif "Notifications" 1
mkepic search "Search" 1
mkepic bill "Billing" 2
mkepic mobile "Mobile apps" 1

# key|epic|kind|prio|weight|complexity|status|labels|created ago|closed ago|due|estimate min|title
# due: +N (days from now), m:N (minutes from now) or empty.  estimate empty = weight*45.
n=0
while IFS='|' read -r key epic kind prio w cx status labels created closed due est title; do
  [ -z "$key" ] && continue
  n=$((n + 1))
  id=$(at "$created" br create "$title" -t "$kind" -p "$prio" --json | jq -r .id)
  echo "$id" >"$TMP/$key"
  [ -n "$epic" ] && br dep add "$id" "$(cat "$TMP/epic-$epic")" -t parent-child --json >/dev/null
  [ -z "$est" ] && est=$((w * 45))
  args="--add-label=weight:$w"
  oldIFS=$IFS
  IFS=,
  for l in $labels; do args="$args --add-label=$l"; done
  IFS=$oldIFS
  # shellcheck disable=SC2086
  at "$created" br update "$id" $args --estimate="$est" --json >/dev/null
  agent=$(agent_of "$labels")
  case $status in
    closed)
      factor=$((70 + (n * 37) % 9 * 10)) # 70..150 percent of the estimate
      min=$((est * factor / 100))
      [ "$min" -lt 5 ] && min=5
      if [ $((n % 3)) -eq 0 ]; then # every third task needed a second attempt
        report "$id" "$agent" failure "$w" "$cx" $((min / 2)) 1 4 3 45 $((closed + 2)) "First try failed in review: the happy path worked but the edge cases did not. Reworking."
        att=2
      else
        att=1
      fi
      report "$id" "$agent" success "$w" "$cx" "$min" "$att" $((8 + n % 20)) 0 $((80 + n % 15)) "$closed" "Done and checked. $(echo "$labels" | tr ',' ' ') tests green."
      at "$closed" br update "$id" --add-label=outcome:success --add-label=complexity:"$cx" --json >/dev/null
      at "$closed" br close "$id" --reason "merged and verified" --json >/dev/null
      ;;
    in_progress)
      age=$((created < 4 ? created : 3 + n % 4))
      at "$age" br update "$id" -s in_progress --assignee="$agent" --json >/dev/null
      ;;
    blocked) at 3 br update "$id" -s blocked --json >/dev/null ;;
  esac
  case $due in
    +*) br update "$id" --due="$(day "${due#+}")" --json >/dev/null ;;
    m:*) br update "$id" --due="$(mins "${due#m:}")" --estimate="$(echo "$est" | awk '{ print ($1 > 120) ? 40 : $1 }')" --json >/dev/null ;;
  esac
done <<'EOF'
signup|auth|feature|1|5|3|closed|backend,security|40|34|||Email and password signup
oauth|auth|feature|1|8|3|closed|backend,security|38|30|||OAuth login with Google
tokens|auth|feature|0|8|4|closed|backend,security|36|27|||Session tokens and refresh
race|auth|bug|0|5|4|in_progress|backend,security|9||m:90||Fix token refresh race
passkey|auth|task|2|5|5|open|security,spike|8||+9||Passkeys (WebAuthn) spike
ratelim|auth|task|1|3|2|closed|backend,security|30|22|||Rate-limit login attempts
reset|auth|feature|2|3|2|closed|backend|28|20|||Password reset emails
sso|auth|feature|2|13|5|open|backend,security|7||+16|2400|SSO for teams (SAML)
audit|auth|feature|3|5|3|open|backend|6||+14||Audit log of sign-ins
recov|auth|feature|1|3|2|blocked|security|5||+4||2FA recovery codes
store|msg|feature|0|8|4|closed|backend|42|33|||Message model and storage
ws|msg|feature|0|13|5|closed|backend,perf|40|28|||Realtime delivery over WebSocket
threads|msg|feature|1|8|3|closed|frontend,backend|34|24|||Threads
edit|msg|feature|2|3|2|closed|frontend|30|21|||Message edit and delete
react|msg|feature|2|3|2|in_progress|frontend|6||m:40||Emoji reactions
upload|msg|feature|1|8|4|open|backend|6||+10|900|File uploads (images and PDF)
dup|msg|bug|0|5|4|closed|backend|20|8|||Fix duplicate delivery on reconnect
typing|msg|feature|3|2|1|open|frontend|5||+7||Typing indicators
md|msg|feature|2|3|2|closed|frontend|26|18|||Markdown rendering
scroll|msg|bug|1|5|3|in_progress|frontend,perf|4||+3|240|Slow scroll in long channels
pin|msg|feature|3|2|1|open|frontend|3||+12||Message pinning
push|notif|feature|1|8|4|closed|backend,infra|31|23|||Push notification service
digest|notif|feature|2|5|2|closed|backend|27|19|||Email digests
quiet|notif|feature|3|3|2|open|backend,ux|5||+8||Quiet hours
mute|notif|feature|2|2|1|closed|ux,frontend|22|16|||Per-channel mute
batch|notif|task|2|5|3|in_progress|backend,perf|5||m:50||Notification batching
unsub|notif|bug|1|1|1|closed|backend|12|3|||Unsubscribe link is broken
desktop|notif|feature|3|3|2|open|frontend|4||+11||Desktop notifications
receipts|notif|feature|3|5|3|blocked|frontend|4||+13||Delivery receipts dashboard
index|search|feature|1|8|4|closed|backend,infra|33|25|||Index messages in OpenSearch
sbox|search|feature|1|5|2|closed|frontend|29|20|||Search box UI
filters|search|feature|2|5|3|open|frontend|6||+6||Filters by person and date
hilite|search|feature|3|2|1|open|frontend|4||+9||Highlight matches
reidx|search|bug|1|5|4|in_progress|backend,perf|7||m:130||Reindex job is slow
saved|search|feature|3|3|2|open|frontend|3||+15||Saved searches
tune|search|task|2|8|5|open|backend|3||+18|1200|Search relevance tuning
plans|bill|feature|2|3|2|closed|frontend|25|17|||Plans and pricing page
stripe|bill|feature|1|8|4|closed|backend|24|15|||Stripe checkout
invoice|bill|feature|2|5|3|open|backend|5||+9||Invoices as PDF
prorate|bill|feature|1|8|5|blocked|backend|6||+7|600|Proration on seat change
dunning|bill|feature|3|3|2|open|backend|3||+14||Dunning emails
vat|bill|feature|2|5|4|open|backend|2||+20||Tax ids and VAT
ios|mobile|feature|1|8|3|closed|mobile|23|6|||iOS app shell
android|mobile|feature|1|8|3|in_progress|mobile|8||+6|1500|Android app shell
offline|mobile|feature|1|13|5|open|mobile|5||+17|2000|Offline message queue
pushreg|mobile|task|2|3|2|closed|mobile|18|5|||Push registration
bio|mobile|feature|3|3|2|open|mobile,security|3||+19||Biometric unlock
crash|mobile|bug|0|5|4|open|mobile|1||+1|120|Crash on cold start (Android 9)
pg16||chore|2|3|2|closed|infra|35|27|||Move CI to the new runners
docs||task|2|3|1|closed|docs|21|2|||Write the public API guide
deps||chore|3|2|1|open|docs|4||+5||Triage dependency updates
style||task|3|2|1|in_progress|docs|3||+2|60|Write the design system tokens
EOF

# dependencies: CHILD needs DEPENDENCY
while IFS='>' read -r a b; do
  [ -z "$a" ] && continue
  br dep add "$(cat "$TMP/$a")" "$(cat "$TMP/$b")" -t blocks --json >/dev/null
done <<'EOF'
recov>tokens
passkey>tokens
race>tokens
react>threads
upload>store
offline>ws
offline>pushreg
android>pushreg
receipts>push
saved>sbox
filters>index
invoice>stripe
prorate>stripe
dunning>invoice
quiet>push
desktop>push
EOF

# cross-repo links: this repo's work needs beads of the infra repo
xdep() { br dep add "$(cat "$TMP/$1")" "external:orbit-infra:$(cat "$TMP/infra-$2")" -t blocks --json >/dev/null; }
xdep reidx os
xdep sso pg
xdep upload cdn
xdep ws redis
xdep batch obs
xdep prorate pg

# discussions: KEY|days ago|author|text
while IFS='|' read -r key ago author text; do
  [ -z "$key" ] && continue
  at "$ago" br comments add "$(cat "$TMP/$key")" --author="$author" --json -- "$text" >/dev/null
done <<'EOF'
race|3|vic|@impl users are being logged out when the app resumes from the background. This is the top bug this week.
race|3|impl|Reproduced. Refresh and logout race: both rewrite the session row. I am holding a lock around the refresh path.
race|2|qa|Added a regression test that resumes the app 50 times in a row. It fails on main and passes on the branch.
race|1|impl|The token refresh race is fixed on the branch. Waiting for review.
passkey|7|vic|Do we want passkeys in the first release? @impl what is the risk?
passkey|6|impl|Browser support is good now. The risk is account recovery: if a user loses the device they lose the account unless recovery codes ship first.
passkey|6|vic|Then recovery codes come first. Keep the spike small: two days at most.
recov|4|impl|Blocked on the session token rework (see the dependency). I will pick it up when the refresh race is merged.
react|5|ux|Picker is in. Open question: do we allow custom emoji in the first version?
react|5|vic|No custom emoji for now. Keep it to the standard set.
scroll|3|ux|Profiled it: the list renders every message. A virtual list drops the render time from 900 ms to 40 ms.
scroll|2|vic|Great. Ship the virtual list, but keep the jump-to-message behaviour working.
reidx|6|infra|The reindex takes 3 hours because of the single shard. Resizing the cluster should cut it to under an hour.
reidx|1|impl|Waiting for the OpenSearch resize (infra repo). Batched writes already gave a 2x speedup.
prorate|5|vic|Finance wants proration to the day, not to the month.
prorate|5|impl|That needs the Postgres 16 upgrade for the new date functions. Linked as a dependency on the infra repo.
sso|6|vic|Two customers are waiting for SAML. Can we do it in a sprint?
sso|6|impl|Thirteen points is my honest estimate. The library does the hard part; testing against real identity providers is the long tail.
offline|4|mobile|The queue needs conflict handling when the same message is edited on two devices. Proposing last-writer-wins plus an edit history.
crash|1|mobile|Crash on Android 9 cold start: a missing permission in the manifest. Fix is one line, I want a test device before shipping.
batch|4|vic|Digest users get 40 pushes in a burst after a reconnect. Please batch them.
batch|3|impl|Grouping by channel in a 30 second window. Found: the push provider rate limits at 600 per minute, so the burst was also being dropped.
ws|34|impl|Load test: 50k concurrent connections on two nodes, p99 delivery 180 ms.
ws|33|vic|Good enough for launch. Revisit when we pass 200k.
stripe|20|impl|Checkout works end to end in test mode. Webhooks are idempotent.
index|28|infra|Indexing keeps up with 2k messages per second. Mapping is versioned so reindexing does not need downtime.
EOF

echo "seeded $ROOT:"
for d in orbit orbit-infra; do
  (cd "$ROOT/$d" && printf '  %s: %s beads\n' "$d" "$(br list --all --json | jq '.issues | length')")
done
(cd "$ROOT/orbit-web" && printf '  orbit-web (bd): %s beads\n' "$(bd list --all --json --limit 0 | jq 'length')")
