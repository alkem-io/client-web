FROM node:12-alpine as builder

# Create app directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

ARG ARG_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
ENV REACT_APP_GRAPHQL_ENDPOINT=${ARG_GRAPHQL_ENDPOINT}

# set build version, date and revision
ARG ARG_BUILD_VERSION=dev
ARG ARG_BUILD_DATE
ARG ARG_BUILD_REVISION
ENV REACT_APP_BUILD_VERSION=${ARG_BUILD_VERSION}
ENV REACT_APP_BUILD_DATE=${ARG_BUILD_DATE}
ENV REACT_APP_BUILD_REVISION=${ARG_BUILD_REVISION}

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Everything for now
COPY . .

RUN npm run-script build

FROM nginx:alpine as production-build
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stage 1
COPY --from=builder /app/build /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
COPY ./.env.deployment/env.sh .
COPY --from=builder /app/.env.deployment/.env.base .
RUN chmod +x env.sh

EXPOSE 80
CMD ["/bin/sh", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
