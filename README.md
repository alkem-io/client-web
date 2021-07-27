<p align="center">
  <a href="http://alkem.io/" target="blank"><img src="https://alkem.io/uploads/logos/alkemio-logo.svg" width="400" alt="Alkemio Logo" /></a>
</p>
<p align="center"><i>Enabling society to collaborate. Building a better future, together.</i></p>

[![Build & Deploy to Dev](https://github.com/alkem-io/client-web/actions/workflows/build-deploy-k8s-dev-azure.yml/badge.svg)](https://github.com/alkem-io/client-web/actions/workflows/build-deploy-k8s-dev-azure.yml)
[![Coverage Status](https://coveralls.io/repos/github/alkem-io/client-web/badge.svg?branch=develop)](https://coveralls.io/github/alkem-io/client-web?branch=develop)
[![BCH compliance](https://bettercodehub.com/edge/badge/alkem-io/client-web?branch=develop)](https://bettercodehub.com/)

# Alkemio Web Client

Welcome to the Alkemio web client - allowing you to browse the contents of an Ecoverse. Please see the [Alkemio repository](../alkemio) for more details on the Alkemio platform.

This client is based on React, and is intended to showcase how clients in general can interact with the domain model exposed by the [Alkemio server](../server).

While this client is a fully self-contained single page application, it also has a set of React components that can be used by other React applications for working with the Alkemio server.

## Configuration

The primary configuration needed is the location of the Alkemio server.

The endpoint url is configured via the `REACT_APP_GRAPHQL_ENDPOINT` environment variable. Add an .env.local file in project's root folder and set the variable to point to the graphql server.

All further configuration is obtained from the server configuration graphql schema.

## Launching the client

Instantiate dependent services:

```bash
   docker-compose -f quickstart-services.yml --env-file .env.docker up --build --force-recreate
```

In the project directory, you can run:

- `npm install`
- `npm start`

This runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

**NB**: The alkemio web client runs on the port specified by the **PORT** env variable (3001 by default). All the alkemio dependencies run behind a traefik reverse proxy running on port 3000 and to make `npm start` run by default with react-scripts, **BROWSER** and **BROWSER_ARGS** env variables are specified to point the browser (Chrome) to port 3000 and not 3001. If you don't have Chrome, manually navigate to http://localhost:3000.

The page will reload if you make edits.<br />
By default, eslint will cause compilation errors and be prominently visible.
Setting `ESLINT_NO_DEV_ERRORS=true` in `.env.local` reduces eslint errors to warnings in the console.

## Development stack

The client development stack includes:

- [React documentation](https://reactjs.org/).
- Typescript
- Apollo Client

For Typescript, the Javascript generated is ES2016.

## Supported web browsers

The Javascript generated is ES2016, which is widely supported.

In addition the client looks to support the primary web browsers active in the market i.e. Edge, Chrome, Mozilla etc. Details of what versions are supported are in the package.json file.

## Docker

The repo is also set up to generate a Docker image.

- To create the docker image: `docker build -t alkemio/client-web:[tag]` where [tag] can be any value
- To add build arguments - docker build --build-arg [argument]=[value]
  - Argument can be the following: ARG_GRAPHQL_ENDPOINT
- To run a container based on the image: `docker container run -p 80:80 alkemio/client-web:[tag]` and then navigate with a browser to `http://localhost:80`

## Pushing code the dockerhub

We have automated the creation and deployment of containers to docker hub via a github action. To automaticly trigger the build up to dockerhub the following steps should be taken:

- Ensure that the code that you would like to create the container from is pushed / merged into the `develop` branch.
- Create a github release and tag it with the appropriate version number ie. `v0.1.3`
- Go to github actions and view the `push to docker` action to see if everything ran correctly.

## Testing

### Tools

- [VS Code](https://code.visualstudio.com/) - development environment
- [Jest](https://jestjs.io/) - component testing
- [Enzyme](https://enzymejs.github.io/enzyme/) - component testing

### Test levels

- Component tests - testing each component in isolation
  - Run tests with coverage `npm run-script test:coverage`
- UI E2E tests - test are part of [this repository](https://github.com/alkem-io/test-suites/tree/develop/test/functional/e2e)
