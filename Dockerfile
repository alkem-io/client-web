FROM node:16.15.0-alpine as builder

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
ENV VITE_APP_BUILD_VERSION=${ARG_BUILD_VERSION}
ENV VITE_APP_BUILD_DATE=${ARG_BUILD_DATE}
ENV VITE_APP_BUILD_REVISION=${ARG_BUILD_REVISION}
ENV VITE_APP_SENTRY_AUTH_TOKEN=${ARG_SENTRY_AUTH_TOKEN}

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm i -g npm@8.5.5
RUN npm install

# Everything for now
COPY . .

# Conditionally run npm run build based on ARG_GRAPHQL_ENDPOINT
RUN if [ "$ARG_BUILD_ENVIRONMENT" = "development" ]; then \
  npm run-script build:dev; \
  else \
  npm run-script build:sentry; \
  fi

FROM nginx:alpine as production-build
COPY ./.build/.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stage 1
COPY --from=builder /app/build /usr/share/nginx/html
RUN if [ "$ARG_BUILD_ENVIRONMENT" = "production" ]; then \
  find ./assets -name "*.map" -type f -delete \
  fi

WORKDIR /usr/share/nginx/html
COPY --from=builder /app/.build/docker/env.sh .
COPY --from=builder /app/.build/docker/.env.base .
RUN chmod +x env.sh

EXPOSE 80
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
