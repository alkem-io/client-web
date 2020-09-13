FROM node:12-alpine as builder

# Create app directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Everything for now
COPY . .

# define server graphql endpoint argument with default value
ARG GRAPHQL_ENDPOINT_ARG="http://localhost:4000/graphql"
RUN echo ${GRAPHQL_ENDPOINT_ARG}
# save build-time argument to an .env file and save it to application work directory (it is used at runtime)
RUN echo "REACT_APP_GRAPHQL_ENDPOINT="${GRAPHQL_ENDPOINT_ARG} > /app/.env

#RUN cat .env
#COPY .env /app/.env
#RUN echo $PWD

RUN npm run-script codegen
RUN npm run-script build

FROM nginx:alpine as production-build
COPY ./.nginx/nginx.conf /etc/nginx/nginx.conf

## Remove default nginx index page
RUN rm -rf /usr/share/nginx/html/*

# Copy from the stage 1
COPY --from=builder /app/build /usr/share/nginx/html

ARG GRAPHQL_ENDPOINT_ARG="http://localhost:4000/graphql"
ENV REACT_APP_GRAPHQL_ENDPOINT=${GRAPHQL_ENDPOINT_ARG}

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
