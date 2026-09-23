#!/usr/bin/env bash
# Resolve a READY Vercel deployment for a main-branch commit SHA.
# Vercel stores commit metadata as meta.githubCommitSha (not gitCommitSha).
set -euo pipefail

COMMIT_SHA="${1:?commit sha required}"
VERCEL_TOKEN="${2:?vercel token required}"
PROJECT="${VERCEL_PROJECT:-adcollection}"
SCOPE="${VERCEL_SCOPE:-inbeat}"
# 20 attempts x 15s = up to 5 minutes for the Vercel build of this commit to become READY.
MAX_ATTEMPTS="${VERCEL_RESOLVE_ATTEMPTS:-20}"
SLEEP_SECONDS="${VERCEL_RESOLVE_SLEEP_SECONDS:-15}"

export COMMIT_SHA

resolve_match() {
  local deployments_file="$1"
  node - "$deployments_file" <<'NODE'
const fs = require("node:fs");
const commitSha = process.env.COMMIT_SHA;
const raw = fs.readFileSync(process.argv[2], "utf8");
const jsonStart = raw.indexOf("{");

if (jsonStart === -1) {
  process.exit(1);
}

const data = JSON.parse(raw.slice(jsonStart));
const deployments = Array.isArray(data) ? data : (data.deployments ?? []);

const forCommit = deployments.filter((deployment) => {
  const sha = deployment.meta?.githubCommitSha ?? deployment.meta?.gitCommitSha;
  return sha === commitSha;
});

const mainMatch =
  forCommit.find((deployment) => deployment.meta?.githubCommitRef === "main") ??
  forCommit[0];

if (!mainMatch?.url) {
  process.exit(1);
}

const url = mainMatch.url.startsWith("http")
  ? mainMatch.url
  : `https://${mainMatch.url}`;

process.stdout.write(
  JSON.stringify({
    url,
    skipPromote: mainMatch.target === "production",
    ref: mainMatch.meta?.githubCommitRef ?? "",
    target: mainMatch.target ?? "",
  }),
);
NODE
}

resolve_once() {
  local deployments_json deployments_file
  deployments_file="$(mktemp)"

  if ! deployments_json="$(bunx vercel@59.16.0 list "$PROJECT" \
    --scope="$SCOPE" \
    --token="$VERCEL_TOKEN" \
    --format=json \
    --status=READY \
    -y 2>&1)"; then
    echo "$deployments_json" >&2
    rm -f "$deployments_file"
    # 2 = the CLI itself failed (unknown project, bad token, revoked scope). Retrying
    # cannot fix that, and doing so reports it as a missing deployment instead.
    return 2
  fi

  printf '%s' "$deployments_json" >"$deployments_file"
  resolve_match "$deployments_file"
  local exit_code=$?
  rm -f "$deployments_file"
  return "$exit_code"
}

for attempt in $(seq 1 "$MAX_ATTEMPTS"); do
  resolve_status=0
  result="$(resolve_once)" || resolve_status=$?

  if [[ "$resolve_status" -eq 2 ]]; then
    echo "Could not query Vercel project \"$PROJECT\" in scope \"$SCOPE\" (see error above). Set VERCEL_PROJECT if the project was renamed." >&2
    exit 1
  fi

  if [[ "$resolve_status" -eq 0 ]]; then
    deployment_url="$(node -e "process.stdout.write(JSON.parse(process.argv[1]).url)" "$result")"
    skip_promote="$(node -e "process.stdout.write(String(JSON.parse(process.argv[1]).skipPromote))" "$result")"
    ref="$(node -e "process.stdout.write(JSON.parse(process.argv[1]).ref)" "$result")"
    target="$(node -e "process.stdout.write(JSON.parse(process.argv[1]).target)" "$result")"

    if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
      {
        echo "deployment_url=$deployment_url"
        echo "skip_promote=$skip_promote"
      } >> "$GITHUB_OUTPUT"
    fi

    echo "Resolved on attempt $attempt/$MAX_ATTEMPTS: $deployment_url (ref=$ref, target=${target:-preview}, skip_promote=$skip_promote)"
    exit 0
  fi

  if [[ "$attempt" -eq "$MAX_ATTEMPTS" ]]; then
    echo "No READY Vercel deployment found for commit $COMMIT_SHA on ref main after $MAX_ATTEMPTS attempts."
    exit 1
  fi

  echo "Attempt $attempt/$MAX_ATTEMPTS: no READY main deployment yet; retrying in ${SLEEP_SECONDS}s..."
  sleep "$SLEEP_SECONDS"
done
