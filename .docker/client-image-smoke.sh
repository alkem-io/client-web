#!/usr/bin/env bash
# workspace#033-client-runtime-hardening — persisted US1 regression (client-web#10081).
#
# Mechanically asserts the `client-web-runtime-image` contract:
#   - both base images are digest-pinned (no floating tags)
#   - the runtime user is non-root (UID 101) and stays non-root at runtime
#   - the container listens on 8080 and serves the SPA
#   - env.sh still performs runtime env-injection (env-config.js is written and
#     picks up container environment overrides)
#   - image size is recorded
#
# Usage: .docker/client-image-smoke.sh <image[:tag]>
set -euo pipefail

IMAGE="${1:?usage: client-image-smoke.sh <image>}"
CONTAINER="client-smoke-$$"
HOST_PORT="${SMOKE_HOST_PORT:-18080}"
DOCKERFILE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/Dockerfile"

fail() {
  echo "FAIL: $*" >&2
  exit 1
}

pass() {
  echo "PASS: $*"
}

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "== client-image-smoke: $IMAGE =="

# --- US1-AS1: both bases digest-pinned ------------------------------------
# Every FROM line must carry an @sha256: pin. A floating tag means rebuilds are
# not reproducible and can silently change the runtime.
UNPINNED="$(grep -E '^FROM ' "$DOCKERFILE" | grep -cv '@sha256:' || true)"
[ "$UNPINNED" = "0" ] ||
  fail "$UNPINNED FROM line(s) in Dockerfile are not digest-pinned"
pass "all Dockerfile bases are digest-pinned"

# --- US1-AS1: image metadata says non-root, port 8080 ----------------------
IMAGE_USER="$(docker inspect "$IMAGE" --format '{{.Config.User}}')"
[ "$IMAGE_USER" = "101" ] || [ "$IMAGE_USER" = "nginx" ] ||
  fail "expected image user 101/nginx (non-root), got '$IMAGE_USER'"
pass "image declares non-root user '$IMAGE_USER'"

PORTS_JSON="$(docker inspect "$IMAGE" --format '{{json .Config.ExposedPorts}}')"
echo "$PORTS_JSON" | grep -q '8080/tcp' ||
  fail "expected 8080/tcp in ExposedPorts, got $PORTS_JSON"
echo "$PORTS_JSON" | grep -q '"80/tcp"' &&
  fail "port 80 is still exposed — the unprivileged runtime must not bind it"
pass "exposes 8080/tcp only"

# --- US1-AS2: starts unprivileged and serves ------------------------------
# A sentinel env var proves env.sh reads the container environment (not just the
# baked .env.base) — the injection behaviour Phase 1 must preserve.
SENTINEL="https://smoke-sentinel.invalid"
docker run -d --name "$CONTAINER" \
  -e VITE_APP_ALKEMIO_DOMAIN="$SENTINEL" \
  -p "$HOST_PORT:8080" "$IMAGE" >/dev/null

for _ in $(seq 1 30); do
  if curl -fsS "http://localhost:$HOST_PORT/" >/dev/null 2>&1; then break; fi
  sleep 1
done

docker ps --filter "name=$CONTAINER" --filter status=running --format '{{.Names}}' |
  grep -q "$CONTAINER" || {
  docker logs "$CONTAINER" >&2 || true
  fail "container is not running"
}
pass "container started without root"

# --- US1-AS2: the RUNNING process is non-root -----------------------------
# Image metadata can be overridden; assert the live process too.
RUNTIME_UID="$(docker exec "$CONTAINER" id -u)"
[ "$RUNTIME_UID" = "101" ] ||
  fail "expected running UID 101, got '$RUNTIME_UID'"
pass "running process UID is $RUNTIME_UID (non-root)"

# --- US1-AS3: SPA is served -----------------------------------------------
STATUS="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$HOST_PORT/")"
[ "$STATUS" = "200" ] || fail "expected HTTP 200 for /, got $STATUS"
curl -fsS "http://localhost:$HOST_PORT/" | grep -qi '<div id="root"' ||
  fail "served / does not look like the SPA index.html"
pass "SPA index.html served (HTTP 200)"

# SPA deep links must fall back to index.html rather than 404.
DEEP_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$HOST_PORT/some/spa/route")"
[ "$DEEP_STATUS" = "200" ] ||
  fail "expected SPA fallback 200 for a deep link, got $DEEP_STATUS"
pass "SPA deep-link fallback works"

# --- US1-AS3: env.sh injection still works --------------------------------
ENV_CONFIG="$(curl -fsS "http://localhost:$HOST_PORT/env-config.js")"
echo "$ENV_CONFIG" | grep -q 'window._env_' ||
  fail "env-config.js does not define window._env_ — env.sh did not run"
echo "$ENV_CONFIG" | grep -q "$SENTINEL" ||
  fail "env-config.js did not pick up the container env override (env.sh regression)"
pass "env.sh injection works and honours container environment"

# robots.txt is rewritten by the same startup script (fail-safe disallow).
curl -fsS "http://localhost:$HOST_PORT/robots.txt" | grep -q 'Disallow' ||
  fail "robots.txt was not written by env.sh"
pass "robots.txt written at startup"

# --- cold-start timing (feeds the k8s probe delays) ------------------------
# The manifests' initialDelaySeconds are justified by this number, so measure it
# rather than asserting it in prose. Fresh container, first HTTP 200.
TIMING_CONTAINER="client-smoke-timing-$$"
docker rm -f "$TIMING_CONTAINER" >/dev/null 2>&1 || true
START_NS="$(date +%s%N)"
docker run -d --name "$TIMING_CONTAINER" -p "$((HOST_PORT + 1)):8080" "$IMAGE" >/dev/null
STARTUP_MS=""
for _ in $(seq 1 300); do
  if curl -fsS "http://localhost:$((HOST_PORT + 1))/" >/dev/null 2>&1; then
    STARTUP_MS="$(( ($(date +%s%N) - START_NS) / 1000000 ))"
    break
  fi
  sleep 0.1
done
docker rm -f "$TIMING_CONTAINER" >/dev/null 2>&1 || true
[ -n "$STARTUP_MS" ] || fail "container never served a 200 within 30s"
echo "STARTUP_MS=$STARTUP_MS"
# The probes use initialDelaySeconds 5 (liveness) / 3 (readiness); anything in
# that ballpark is fine, but a multi-second regression means the delays need a
# second look rather than a silent pass.
[ "$STARTUP_MS" -lt 3000 ] ||
  fail "cold start ${STARTUP_MS}ms exceeds the 3s readiness initialDelay the manifests assume"
pass "cold start ${STARTUP_MS}ms (probe initialDelays 3s/5s have headroom)"

# --- size record ----------------------------------------------------------
IMAGE_SIZE_BYTES="$(docker image inspect "$IMAGE" --format '{{.Size}}')"
echo "IMAGE_DIGEST=$(docker image inspect "$IMAGE" --format '{{.Id}}')"
echo "IMAGE_SIZE_BYTES=$IMAGE_SIZE_BYTES"

echo "== client-image-smoke: ALL CHECKS PASSED =="
