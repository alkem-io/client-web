FROM node:22.21.1-alpine as builder

# Create app directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

ARG ARG_GRAPHQL_ENDPOINT=/graphql
ENV VITE_APP_GRAPHQL_ENDPOINT=${ARG_GRAPHQL_ENDPOINT}

# set build version, date and revision
ARG ARG_BUILD_ENVIRONMENT=development
ARG ARG_BUILD_VERSION=dev
ARG ARG_BUILD_DATE
ARG ARG_BUILD_REVISION
ARG ARG_SENTRY_AUTH_TOKEN
ENV VITE_APP_BUILD_VERSION=${ARG_BUILD_VERSION}
ENV VITE_APP_BUILD_DATE=${ARG_BUILD_DATE}
ENV VITE_APP_BUILD_REVISION=${ARG_BUILD_REVISION}
ENV VITE_APP_SENTRY_AUTH_TOKEN=${ARG_SENTRY_AUTH_TOKEN}

# Install app dependencies
# A wildcard is used to ensure both package.json AND pnpm-lock.yaml are copied
# where available (pnpm)
COPY package*.json pnpm-lock.yaml ./

# Install pnpm globally
RUN npm i -g pnpm@10.17.1
RUN pnpm install

# Everything for now
COPY . .

# Conditionally run pnpm run build based on ARG_GRAPHQL_ENDPOINT
RUN if [ "$ARG_BUILD_ENVIRONMENT" = "development" ]; then \
  pnpm run-script build:dev; \
  else \
  pnpm run-script build:sentry; \
  fi

FROM nginx:alpine as production-build
ARG ARG_BUILD_ENVIRONMENT=development
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
RUN chmod +x env.sh

EXPOSE 80
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
