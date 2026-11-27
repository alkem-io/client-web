#!/usr/bin/env bash
# Elastic APM source maps for client-web (client-web#10549).
#
# APM de-minifies a RUM stack frame only when a map is stored under the exact
# (service name, service version, bundle URL) the frame reports. The only
# supported write path is Kibana's source map API (APM Server's own upload
# endpoint was removed in 8.0).
#
# Why this is split into two commands: every Kibana upload AND every delete
# re-reads the newest stored maps and rewrites the APM Fleet package policy
# (updateSourceMapsOnFleetPolicies), and all of those rewrites queue on the one
# policy. A release is ~550 maps, so uploading costs ~8 min and pruning the
# oldest version as much again. The release only uploads; pruning runs off the
# release path (.github/workflows/apm-sourcemaps.yml).
#
# Usage:
#   sourcemaps.sh upload <dir-with-*.js.map>
#   sourcemaps.sh prune
#
# Environment (both commands):
#   KIBANA_URL                    e.g. https://kibana.alkem.io
#   KIBANA_APM_SOURCEMAP_API_KEY  Kibana API key, "APM and User Experience: All"
#   APM_SERVICE_NAME              default alkemio-client-web
#   APM_CONCURRENCY               parallel uploads or deletes, default 8. Kibana
#                                 serialises on the Fleet policy update, so going
#                                 higher mostly adds queueing, not throughput.
#   APM_SOURCEMAPS_STRICT         true (default): any problem exits 1 and fails
#                                 the job. false: problems are warnings, exit 0.
#
# upload:
#   SERVICE_VERSION               must equal the RUM agent's serviceVersion, i.e.
#                                 package.json "version" (VITE_VERSION), NOT the tag
#   APM_BUNDLE_PATH               URL path the bundles are served under, default
#                                 /assets. Maps are uploaded path-only (no host):
#                                 APM Server falls back from a frame's full URL to
#                                 its path, so one upload serves every host.
#   MAX_SOURCEMAP_BYTES           largest map Kibana accepts, default 15728640
#                                 (15 MB, Kibana's server.maxPayload as raised in
#                                 reporting-orchestration). A bigger map is
#                                 reported before anything uploads.
#
# prune:
#   KEEP_VERSIONS                 newest service versions (by upload time) whose
#                                 maps are kept, default 3, minimum 1.
set -euo pipefail

cmd="${1:-}"
export APM_SERVICE_NAME="${APM_SERVICE_NAME:-alkemio-client-web}"
concurrency="${APM_CONCURRENCY:-8}"
strict="${APM_SOURCEMAPS_STRICT:-true}"

# Bytes as MB with one decimal, for the logs.
mb() { awk -v b="$1" 'BEGIN { printf "%.1f MB", b / 1048576 }'; }

# Stop on a problem: an error that fails the job when strict, else a warning.
fail() {
  if [ "$strict" = "true" ]; then
    echo "::error::$1"
    exit 1
  fi
  echo "::warning::$1 (APM_SOURCEMAPS_STRICT=false, not failing)"
  exit 0
}

require_kibana() {
  if [ -z "${KIBANA_URL:-}" ] || [ -z "${KIBANA_APM_SOURCEMAP_API_KEY:-}" ]; then
    fail "KIBANA_URL or KIBANA_APM_SOURCEMAP_API_KEY not set; nothing done"
  fi
  export KIBANA_URL KIBANA_APM_SOURCEMAP_API_KEY
}

# One upload: "<map path> <bundle url>". Prints exactly one line (curl's own
# stderr goes into it, so parallel workers never interleave); non-zero on failure.
upload_one() {
  local map="$1" url="$2" response err result status seconds
  response="$(mktemp)"
  err="$(mktemp)"
  result="$(curl -sS -o "$response" -w '%{http_code} %{time_total}' --retry 2 2>"$err" \
    -X POST "$KIBANA_URL/api/apm/sourcemaps" \
    -H 'kbn-xsrf: true' \
    -H "Authorization: ApiKey $KIBANA_APM_SOURCEMAP_API_KEY" \
    -F "service_name=$APM_SERVICE_NAME" \
    -F "service_version=$SERVICE_VERSION" \
    -F "bundle_filepath=$url" \
    -F "sourcemap=@$map")" || result="curl-error -"
  status="${result%% *}"
  seconds="${result##* }"
  if [ "$status" = "200" ]; then
    echo "uploaded $url ($(wc -c < "$map" | awk '{ printf "%.0f KB", $1 / 1024 }'), ${seconds}s)"
    rm -f "$response" "$err"
  else
    echo "::error::$url -> HTTP $status: $(cat "$err" "$response" 2>/dev/null | tr '\n' ' ' | head -c 300 || true)"
    rm -f "$response" "$err"
    return 1
  fi
}

# One delete by Fleet artifact id. 404 counts as done (already gone).
delete_one() {
  local id="$1" version="$2" status
  status="$(curl -sS -o /dev/null -w '%{http_code}' --retry 2 2>/dev/null -X DELETE \
    "$KIBANA_URL/api/apm/sourcemaps/$(jq -rn --arg id "$id" '$id | @uri')" \
    -H 'kbn-xsrf: true' \
    -H "Authorization: ApiKey $KIBANA_APM_SOURCEMAP_API_KEY")" || status="curl-error"
  if [ "$status" = "200" ] || [ "$status" = "404" ]; then
    echo "deleted $version $id (HTTP $status)"
    return 0
  fi
  echo "::warning::deleting source map $id ($version) -> HTTP $status"
  return 1
}
export -f upload_one delete_one

cmd_upload() {
  local dir="${1:?usage: sourcemaps.sh upload <dir-with-*.js.map>}"
  export SERVICE_VERSION="${SERVICE_VERSION:?SERVICE_VERSION is required}"
  local bundle_path="${APM_BUNDLE_PATH:-/assets}"
  local max_bytes="${MAX_SOURCEMAP_BYTES:-15728640}"

  require_kibana
  echo "APM source maps upload for $APM_SERVICE_NAME@$SERVICE_VERSION"
  echo "  kibana:      $KIBANA_URL (API key set)"
  echo "  maps from:   $dir, uploaded as $bundle_path/<bundle>.js"
  echo "  concurrency: $concurrency, max map: $(mb "$max_bytes"), strict: $strict"

  shopt -s nullglob
  local maps=("$dir"/*.js.map)
  [ "${#maps[@]}" -gt 0 ] || fail "no *.js.map files in $dir"

  # Kibana rejects an oversized request with 413 only after the others
  # uploaded, leaving a partial set; catch it up front. 4 KB covers the
  # multipart fields. Also builds the job list, largest map first: the big
  # entry bundles start right away instead of becoming a long tail at the end.
  local too_big=0 total_bytes=0 empty=0 size map sized jobs largest
  sized="$(mktemp)"
  jobs="$(mktemp)"
  for map in "${maps[@]}"; do
    # A map with no sources resolves no frame (the translation chunks, ~165
    # per release: JSON compiled to JS). Each upload costs ~7s of Kibana's
    # Fleet policy work whatever its size, so these are skipped.
    if [ "$(jq '.sources | length' "$map")" -eq 0 ]; then
      empty=$((empty + 1))
      continue
    fi
    size="$(wc -c < "$map")"
    total_bytes=$((total_bytes + size))
    if [ $((size + 4096)) -gt "$max_bytes" ]; then
      echo "::error::$(basename "$map") is $size bytes, over the $max_bytes Kibana accepts (server.maxPayload)"
      too_big=$((too_big + 1))
    fi
    # Vite's hashed file names contain no whitespace, so plain word splitting
    # into "<map> <bundle path>" is safe.
    echo "$size $map $bundle_path/$(basename "$map" .map)" >> "$sized"
  done
  echo "skipping $empty of ${#maps[@]} source map(s) with no sources"
  if ! [ -s "$sized" ]; then
    rm -f "$sized" "$jobs"
    fail "no source map in $dir has any sources"
  fi
  sort -rn "$sized" | cut -d' ' -f2- > "$jobs"
  largest="$(sort -rn "$sized" | head -n1)"
  rm -f "$sized"
  echo "uploading $((${#maps[@]} - empty)) source map(s), $(mb "$total_bytes") in total; largest $(basename "$(echo "$largest" | cut -d' ' -f2)") ($(mb "${largest%% *}"))"
  if [ "$too_big" -ne 0 ]; then
    rm -f "$jobs"
    fail "$too_big source map(s) too big for Kibana; none uploaded"
  fi

  local total log upload_ok=1 started=$SECONDS uploaded
  total="$(wc -l < "$jobs")"
  log="$(mktemp)"
  # xargs exits non-zero if any upload failed; that, not the log, decides.
  xargs -P "$concurrency" -n 2 bash -c 'upload_one "$@"' _ < "$jobs" > "$log" 2>&1 || upload_ok=0
  # Successes fold into a collapsed group; failures stay visible below it.
  echo "::group::Uploaded source maps"
  grep '^uploaded ' "$log" || true
  echo "::endgroup::"
  grep -v '^uploaded ' "$log" || true
  uploaded="$(grep -c '^uploaded ' "$log" || true)"
  rm -f "$jobs" "$log"

  echo "uploaded $uploaded/$total source map(s) for $APM_SERVICE_NAME@$SERVICE_VERSION, $((total - uploaded)) failed, in $((SECONDS - started))s"
  if [ "$upload_ok" -ne 1 ] || [ "$uploaded" -ne "$total" ]; then
    fail "$((total - uploaded)) of $total source map upload(s) failed"
  fi
}

cmd_prune() {
  local keep_versions="${KEEP_VERSIONS:-3}"
  if ! [ "$keep_versions" -ge 1 ] 2>/dev/null; then
    fail "KEEP_VERSIONS must be an integer >= 1, got '$keep_versions'"
  fi

  require_kibana
  echo "APM source maps prune for $APM_SERVICE_NAME"
  echo "  kibana:      $KIBANA_URL (API key set)"
  echo "  concurrency: $concurrency, keep versions: $keep_versions, strict: $strict"

  # Kibana keeps every uploaded map forever. The list API returns each map's
  # full body, newest first, so only the id/version/created of each are kept.
  local per_page=100 page=1 listed=0 index body status count started=$SECONDS
  index="$(mktemp)"
  while :; do
    body="$(mktemp)"
    status="$(curl -sS --compressed -o "$body" -w '%{http_code}' --retry 2 \
      "$KIBANA_URL/api/apm/sourcemaps?page=$page&perPage=$per_page" \
      -H "Authorization: ApiKey $KIBANA_APM_SOURCEMAP_API_KEY")" || status="curl-error"
    if [ "$status" != "200" ]; then
      rm -f "$body" "$index"
      fail "listing source maps failed (HTTP $status); nothing deleted"
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
  echo "listed $listed source map(s) in $((SECONDS - started))s, $(wc -l < "$index") of them for $APM_SERVICE_NAME:"
  # Per version, newest upload first: "  <version>  <maps>  uploaded <newest>".
  sort -t$'\t' -k3,3r "$index" | awk -F'\t' '!($2 in n) { order[++k] = $2; at[$2] = $3 } { n[$2]++ }
    END { for (i = 1; i <= k; i++) printf "  %-12s %5d map(s), uploaded %s\n", order[i], n[order[i]], at[order[i]] }'

  # Keep the versions with the newest uploads; everything else is stale.
  local keep stale stale_count
  keep="$(sort -t$'\t' -k3,3r "$index" | cut -f2 | awk '!seen[$0]++' | head -n "$keep_versions")"
  stale="$(mktemp)"
  KEEP="$keep" awk -F'\t' 'BEGIN { n = split(ENVIRON["KEEP"], k, "\n"); for (i = 1; i <= n; i++) kept[k[i]] = 1 }
    !($2 in kept) { print $1, $2 }' "$index" > "$stale"
  rm -f "$index"
  stale_count="$(wc -l < "$stale")"
  echo "keeping versions: $(echo "$keep" | paste -sd' ' -)"
  if [ "$stale_count" -eq 0 ]; then
    rm -f "$stale"
    echo "nothing to prune"
    return 0
  fi
  echo "deleting $stale_count older source map(s) of: $(cut -d' ' -f2 "$stale" | sort -u | paste -sd' ' -)"

  local log prune_failed
  log="$(mktemp)"
  started=$SECONDS
  xargs -P "$concurrency" -n 2 bash -c 'delete_one "$@"' _ < "$stale" > "$log" 2>&1 || true
  echo "::group::Deleted source maps"
  grep '^deleted ' "$log" || true
  echo "::endgroup::"
  grep -v '^deleted ' "$log" || true
  prune_failed="$(grep -c '^::warning::deleting' "$log" || true)"
  rm -f "$stale" "$log"
  echo "pruned $((stale_count - prune_failed))/$stale_count older source map(s) in $((SECONDS - started))s"
  # A failed delete only leaves an old map behind (the next run retries it),
  # but the key or Kibana is likely broken, so it still counts as a problem.
  [ "$prune_failed" -eq 0 ] || fail "$prune_failed older source map(s) could not be deleted"
}

case "$cmd" in
  upload) shift; cmd_upload "$@" ;;
  prune) cmd_prune ;;
  *)
    echo "usage: sourcemaps.sh upload <dir-with-*.js.map> | sourcemaps.sh prune" >&2
    exit 2
    ;;
esac
