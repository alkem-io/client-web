# workspace#033-client-runtime-hardening — Phase 1 (client-web#10081).
#
# Both stages are digest-pinned (previously floating tags): a floating base means
# every rebuild can silently pick up different content. Resolve a new digest with
#   docker buildx imagetools inspect <image>:<tag> --format '{{.Manifest.Digest}}'
# and update the pin together with the tag it corresponds to.
FROM node:24.14.0-alpine@sha256:7fddd9ddeae8196abf4a3ef2de34e11f7b1a722119f91f28ddf1e99dcafdf114 as builder

# Create app directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# set build version, date and revision
ARG ARG_BUILD_ENVIRONMENT=development
ARG ARG_BUILD_VERSION=dev
ARG ARG_BUILD_DATE
ARG ARG_BUILD_REVISION
ARG ARG_SENTRY_AUTH_TOKEN
ENV VITE_BUILD_VERSION=${ARG_BUILD_VERSION}
ENV VITE_BUILD_DATE=${ARG_BUILD_DATE}
ENV VITE_BUILD_REVISION=${ARG_BUILD_REVISION}
ENV SENTRY_AUTH_TOKEN=${ARG_SENTRY_AUTH_TOKEN}

# Install app dependencies
# A wildcard is used to ensure both package.json AND pnpm-lock.yaml are copied
# where available (pnpm)
COPY package*.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm i -g pnpm@10.17.1
RUN pnpm install

# Everything for now
COPY . .

# Conditionally run pnpm run build based on ARG_BUILD_ENVIRONMENT
RUN if [ "$ARG_BUILD_ENVIRONMENT" = "development" ]; then \
  pnpm run-script build:dev; \
  else \
  pnpm run-script build:sentry; \
  fi

# Runtime: nginxinc/nginx-unprivileged — the official non-root nginx image.
# It runs as UID 101 and listens on 8080 (a non-root process cannot bind ports
# below 1024), and relocates the pid/temp paths to writable locations. The
# Service's external port stays 80; only its targetPort follows to 8080
# (dev-orchestration, same feature — the manifest and image MUST ship together).
FROM nginxinc/nginx-unprivileged:1.30-alpine@sha256:44e36330f74d4f3a1d4e222acca9e23b401fb87811a7597024502bb759c4dd49 as production-build
ARG ARG_BUILD_ENVIRONMENT=development

# Root is needed only to lay down files and hand ownership to UID 101; the
# container itself runs unprivileged (USER 101 below, inherited from the base
# but declared explicitly so it survives future edits to this stage).
USER root

COPY ./.build/.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stage 1
COPY --from=builder /app/build /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

RUN if [ "$ARG_BUILD_ENVIRONMENT" = "production" ]; then \
  find /usr/share/nginx/html/assets -name "*.map" -type f -delete; \
  fi
COPY --from=builder /app/.build/docker/env.sh .
COPY --from=builder /app/.build/docker/.env.base .

# env.sh runs at container start and WRITES env-config.js + robots.txt into this
# directory, so UID 101 must own it — otherwise the unprivileged container dies
# on startup. This is the one substantive difference from the root-era image.
RUN chmod +x env.sh && chown -R 101:101 /usr/share/nginx/html

USER 101

EXPOSE 8080
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
