#!/usr/bin/env bash
# Upload a release's source maps to Elastic APM (client-web#10549).
#
# APM de-minifies a RUM stack frame only when a map is stored under the exact
# (service name, service version, bundle URL) the frame reports. In 8.x the only
# supported write path is Kibana's source map API; APM Server's own upload
# endpoint was removed in 8.0.
#
# Usage: upload-sourcemaps.sh <dir-with-*.js.map>
#
# Environment:
#   KIBANA_URL                    e.g. https://kibana.alkem.io
#   KIBANA_APM_SOURCEMAP_API_KEY  Kibana API key, "APM and User Experience: All"
#   SERVICE_VERSION               must equal the RUM agent's serviceVersion, i.e.
#                                 package.json "version" (VITE_VERSION), NOT the tag
#   APM_SERVICE_NAME              default alkemio-client-web
#   APM_BUNDLE_PATH               URL path the bundles are served under, default
#                                 /assets. Maps are uploaded path-only (no host):
#                                 APM Server falls back from a frame's full URL to
#                                 its path, so one upload serves every host
#                                 (alkem.io, identity.alkem.io, ...).
#   UPLOAD_CONCURRENCY            parallel uploads and deletes, default 8
#   KEEP_VERSIONS                 newest service versions whose maps are kept,
#                                 default 3; older ones are deleted after a fully
#                                 successful upload. 0 disables pruning.
#
# Without the key (or KIBANA_URL) it skips with a warning, so a release never
# fails for lack of credentials.
set -euo pipefail

dir="${1:?usage: upload-sourcemaps.sh <dir-with-*.js.map>}"
export APM_SERVICE_NAME="${APM_SERVICE_NAME:-alkemio-client-web}"
export SERVICE_VERSION="${SERVICE_VERSION:?SERVICE_VERSION is required}"
bundle_path="${APM_BUNDLE_PATH:-/assets}"
concurrency="${UPLOAD_CONCURRENCY:-8}"
keep_versions="${KEEP_VERSIONS:-3}"

if [ -z "${KIBANA_URL:-}" ] || [ -z "${KIBANA_APM_SOURCEMAP_API_KEY:-}" ]; then
  echo "::warning::KIBANA_URL or KIBANA_APM_SOURCEMAP_API_KEY not set; skipping APM source map upload"
  exit 0
fi
export KIBANA_URL KIBANA_APM_SOURCEMAP_API_KEY

shopt -s nullglob
maps=("$dir"/*.js.map)
if [ "${#maps[@]}" -eq 0 ]; then
  echo "::error::no *.js.map files in $dir"
  exit 1
fi

# One upload: "<map path> <bundle url>". Prints exactly one line (curl's own
# stderr goes into it, so parallel workers never interleave); non-zero on failure.
upload_one() {
  local map="$1" url="$2" response err status
  response="$(mktemp)"
  err="$(mktemp)"
  status="$(curl -sS -o "$response" -w '%{http_code}' --retry 2 2>"$err" \
    -X POST "$KIBANA_URL/api/apm/sourcemaps" \
    -H 'kbn-xsrf: true' \
    -H "Authorization: ApiKey $KIBANA_APM_SOURCEMAP_API_KEY" \
    -F "service_name=$APM_SERVICE_NAME" \
    -F "service_version=$SERVICE_VERSION" \
    -F "bundle_filepath=$url" \
    -F "sourcemap=@$map;type=application/json")" || status="curl-error"
  if [ "$status" = "200" ]; then
    echo "uploaded $url"
    rm -f "$response" "$err"
  else
    echo "::error::$url -> HTTP $status: $(cat "$err" "$response" 2>/dev/null | tr '\n' ' ' | head -c 300 || true)"
    rm -f "$response" "$err"
    return 1
  fi
}
export -f upload_one

# One "<map> <bundle path>" line per upload. Vite's hashed file names contain
# no whitespace, so plain word splitting into two arguments is safe.
jobs="$(mktemp)"
for map in "${maps[@]}"; do
  echo "$map $bundle_path/$(basename "$map" .map)"
done > "$jobs"
total="$(wc -l < "$jobs")"

log="$(mktemp)"
# xargs exits non-zero if any upload failed; that, not the log, decides.
upload_ok=1
xargs -P "$concurrency" -n 2 bash -c 'upload_one "$@"' _ < "$jobs" > "$log" 2>&1 || upload_ok=0
cat "$log"
uploaded="$(grep -c '^uploaded ' "$log" || true)"
rm -f "$jobs" "$log"

echo "uploaded $uploaded/$total source map(s) for $APM_SERVICE_NAME@$SERVICE_VERSION, $((total - uploaded)) failed"
if [ "$upload_ok" -ne 1 ] || [ "$uploaded" -ne "$total" ]; then
  echo "::warning::upload incomplete; not pruning older source maps"
  exit 1
fi
[ "$keep_versions" -gt 0 ] || exit 0

# Prune: Kibana keeps every uploaded map forever. Keep this service's newest
# $keep_versions versions (ranked by upload time, so the version just uploaded
# is always kept) and delete the rest. The list API returns each map's full
# body, newest first, so only the id/name/version/created of each are kept.
per_page=100
page=1
index="$(mktemp)"
while :; do
  body="$(mktemp)"
  status="$(curl -sS --compressed -o "$body" -w '%{http_code}' --retry 2 \
    "$KIBANA_URL/api/apm/sourcemaps?page=$page&perPage=$per_page" \
    -H "Authorization: ApiKey $KIBANA_APM_SOURCEMAP_API_KEY")" || status="curl-error"
  if [ "$status" != "200" ]; then
    echo "::warning::listing source maps failed (HTTP $status); not pruning"
    rm -f "$body" "$index"
    exit 0
  fi
  jq -r --arg s "$APM_SERVICE_NAME" \
    '.artifacts[] | select(.body.serviceName == $s) | [.id, .body.serviceVersion, .created] | @tsv' \
    "$body" >> "$index"
  count="$(jq '.artifacts | length' "$body")"
  listed="$(jq '.total' "$body")"
  rm -f "$body"
  if [ "$count" -lt "$per_page" ] || [ $((page * per_page)) -ge "$listed" ]; then
    break
  fi
  page=$((page + 1))
done

# Versions, newest upload first; the current one leads even if clocks disagree.
keep="$( { echo "$SERVICE_VERSION"; sort -t$'\t' -k3,3r "$index" | cut -f2; } \
  | awk '!seen[$0]++' | head -n "$keep_versions")"
stale="$(mktemp)"
KEEP="$keep" awk -F'\t' 'BEGIN { n = split(ENVIRON["KEEP"], k, "\n"); for (i = 1; i <= n; i++) kept[k[i]] = 1 }
  !($2 in kept) { print $1 }' "$index" > "$stale"
rm -f "$index"
stale_count="$(wc -l < "$stale")"
echo "keeping versions: $(echo "$keep" | paste -sd' ' -); deleting $stale_count older source map(s)"

delete_one() {
  local id="$1" status
  status="$(curl -sS -o /dev/null -w '%{http_code}' --retry 2 2>/dev/null -X DELETE \
    "$KIBANA_URL/api/apm/sourcemaps/$(jq -rn --arg id "$id" '$id | @uri')" \
    -H 'kbn-xsrf: true' \
    -H "Authorization: ApiKey $KIBANA_APM_SOURCEMAP_API_KEY")" || status="curl-error"
  # 404: already gone (e.g. a concurrent release pruned it).
  if [ "$status" = "200" ] || [ "$status" = "404" ]; then
    return 0
  fi
  echo "::warning::deleting source map $id -> HTTP $status"
  return 1
}
export -f delete_one

log="$(mktemp)"
xargs -P "$concurrency" -n 1 bash -c 'delete_one "$@"' _ < "$stale" > "$log" 2>&1 || true
cat "$log"
prune_failed="$(grep -c '^::warning::deleting' "$log" || true)"
rm -f "$stale" "$log"
# A failed delete only leaves an old map behind; the next release retries it.
echo "pruned $((stale_count - prune_failed))/$stale_count older source map(s)"
