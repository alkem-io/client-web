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
#   APM_BUNDLE_ORIGINS            space-separated origins the bundles are served from,
#                                 default "https://alkem.io https://identity.alkem.io"
#   UPLOAD_CONCURRENCY            parallel uploads, default 8
#
# Without KIBANA_URL or the key it skips with a warning, so a release never fails
# for lack of credentials.
set -euo pipefail

dir="${1:?usage: upload-sourcemaps.sh <dir-with-*.js.map>}"
export APM_SERVICE_NAME="${APM_SERVICE_NAME:-alkemio-client-web}"
export SERVICE_VERSION="${SERVICE_VERSION:?SERVICE_VERSION is required}"
origins="${APM_BUNDLE_ORIGINS:-https://alkem.io https://identity.alkem.io}"
concurrency="${UPLOAD_CONCURRENCY:-8}"

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

# One upload: "<map path> <bundle url>". Prints one line; non-zero on failure.
upload_one() {
  local map="$1" url="$2" response status
  response="$(mktemp)"
  status="$(curl -sS -o "$response" -w '%{http_code}' --retry 2 \
    -X POST "$KIBANA_URL/api/apm/sourcemaps" \
    -H 'kbn-xsrf: true' \
    -H "Authorization: ApiKey $KIBANA_APM_SOURCEMAP_API_KEY" \
    -F "service_name=$APM_SERVICE_NAME" \
    -F "service_version=$SERVICE_VERSION" \
    -F "bundle_filepath=$url" \
    -F "sourcemap=@$map;type=application/json")" || status="curl-error"
  if [ "$status" = "200" ]; then
    echo "uploaded $url"
    rm -f "$response"
  else
    echo "::error::$url -> HTTP $status: $(head -c 300 "$response" 2>/dev/null || true)"
    rm -f "$response"
    return 1
  fi
}
export -f upload_one

# One "<map> <url>" line per upload. Vite's hashed file names contain no
# whitespace, so plain word splitting into two arguments is safe.
jobs="$(mktemp)"
for map in "${maps[@]}"; do
  for origin in $origins; do
    echo "$map $origin/assets/$(basename "$map" .map)"
  done
done > "$jobs"
total="$(wc -l < "$jobs")"

log="$(mktemp)"
xargs -P "$concurrency" -n 2 bash -c 'upload_one "$@"' _ < "$jobs" > "$log" 2>&1 || true
cat "$log"
failed="$(grep -c '^::error::' "$log" || true)"
rm -f "$jobs" "$log"

echo "uploaded $((total - failed))/$total source map(s) for $APM_SERVICE_NAME@$SERVICE_VERSION, $failed failed"
[ "$failed" -eq 0 ]
