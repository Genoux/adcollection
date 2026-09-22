#!/usr/bin/env bash
# Fails when the Payload config describes a schema that the committed migrations do
# not produce. `migrate:create` diffs the config against the newest snapshot in
# src/migrations without connecting to a database, so this runs on placeholder env.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

MIGRATIONS=src/migrations
before="$(ls "$MIGRATIONS")"
cp "$MIGRATIONS/index.ts" /tmp/migrations-index.ts

bunx payload migrate:create schema_drift_check --skip-empty >/dev/null

created="$(comm -13 <(echo "$before") <(ls "$MIGRATIONS"))"

if [[ -z "$created" ]]; then
  echo "Migrations match the Payload config."
  exit 0
fi

echo "The Payload config changed without a migration. Run: bun run migrate:create <name>"
echo "Missing SQL:"
for file in $created; do
  [[ "$file" == *.ts ]] && sed -n '/up(/,/^}/p' "$MIGRATIONS/$file"
done

# Leave the working tree as found so running this locally is harmless.
for file in $created; do rm "$MIGRATIONS/$file"; done
cp /tmp/migrations-index.ts "$MIGRATIONS/index.ts"
exit 1
