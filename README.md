<p align="center">
  <a href="https://alkemio.foundation/" target="blank"><img src="https://alkem.io/logo.png" width="400" alt="Alkemio Logo" /></a>
</p>
<p align="center"><i>Empowering society. The platform to succeed in working on challenges, together.</i></p>

[![Build & Deploy to Dev](https://github.com/alkem-io/client-web/actions/workflows/build-deploy-k8s-dev-hetzner.yml/badge.svg)](https://github.com/alkem-io/client-web/actions/workflows/build-deploy-k8s-dev-azure.yml)
[![Coverage Status](https://coveralls.io/repos/github/alkem-io/client-web/badge.svg?branch=develop)](https://coveralls.io/github/alkem-io/client-web?branch=develop)
[![Crowdin](https://badges.crowdin.net/alkemio/localized.svg)](https://crowdin.com/project/alkemio)

# Alkemio Web Client

Welcome to the Alkemio web client - allowing you to browse the contents of the Alkemio Platform. Please see the [Alkemio repository](https://github.com/alkem-io/alkemio) for more details on the Alkemio platform.

This client is based on React, and is intended to showcase how clients in general can interact with the domain model exposed by the [Alkemio server](https://github.com/alkem-io/server).

## Configuration

Beyond the bootstrap configuration to point to the Alkemio server, all further configuration is obtained from the server configuration graphql schema.

## Launching the client

To develop with the client, it is necessary to leverage the Alkemio server repository to get a working instance of the Alkemio server running. For details on getting a working Alkemio server running please [consult the following documentation](https://github.com/alkem-io/server/blob/develop/docs/Running.md).

Once you can confirm that you have a running Alkemio server, then you can start with the launching of the Alkemio client.

In the project directory, you can run:

- `pnpm install`
- `pnpm start`

This runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

**NB**: The alkemio web client runs on the port specified by the **PORT** env variable (3001 by default). All the alkemio dependencies run behind a traefik reverse proxy running on port 3000. Manually navigate to http://localhost:3000 to open the app.

The page will reload if you make edits.<br />
By default, eslint will cause compilation errors and be prominently visible.
Setting `ESLINT_NO_DEV_ERRORS=true` in `.env.local` reduces eslint errors to warnings in the console.

## Environment variables

Environment variables are used as usual in React applications.

Vite does not acknowledge variable at runtime, so `./.build/docker/env.sh` is run everytime before launching the application.
For it to work properly, you need to have a `.env` file in the root of the project. Yes - it is commited to the code base. Locally you can use .env.local.

The script is reading the variables from `.env` and combines them with the values from the same variables in your deployment environment.
The result is added to `./.build/docker/.env.base`.
The variables are also attached to the `window` object of the browser, via `_env_` field.

## Development stack

The client development stack includes:

- [React documentation](https://reactjs.org/).
- Typescript
- Apollo Client
- React Compiler (automatic performance optimization)

For Typescript, the Javascript generated is ES2016.

### React Compiler

The project uses the React Compiler (babel-plugin-react-compiler) to automatically optimize React components. The compiler adds automatic memoization to components and hooks, reducing the need for manual `useMemo`, `useCallback`, and `React.memo` calls.

Benefits:

- Automatic performance optimization
- Cleaner code with less boilerplate
- Works seamlessly with React 19

For more details, see [docs/react-compiler.md](docs/react-compiler.md).

### Bundle Analysis

Analyze your bundle size and composition:

```bash
pnpm analyze        # Production build with analysis
pnpm analyze:dev    # Development build with analysis
pnpm analyze:sentry # Production build with Sentry + analysis
```

This generates an interactive visualization at `build/stats.html` showing module sizes, dependencies, and optimization opportunities. For more details, see [docs/bundle-analysis.md](docs/bundle-analysis.md).

## Supported web browsers

The Javascript generated is ES2016, which is widely supported.

In addition the client looks to support the primary web browsers active in the market i.e. Edge, Chrome, Mozilla etc. Details of what versions are supported are in the package.json file.

## Docker

The repo is also set up to generate a Docker image.

- To create the docker image: `docker build -t alkemio/client-web:[tag]` where [tag] can be any value
- To add build arguments - docker build --build-arg [argument]=[value]
  - Argument can be the following: ARG_GRAPHQL_ENDPOINT
- To run a container based on the image: `docker container run -p 80:80 alkemio/client-web:[tag]` and then navigate with a browser to `http://localhost:80`

## Pushing code the dockerspace

We have automated the creation and deployment of containers to docker space via a github action. To automaticly trigger the build up to dockerspace the following steps should be taken:

- Ensure that the code that you would like to create the container from is pushed / merged into the `develop` branch.
- Create a github release and tag it with the appropriate version number ie. `v0.1.3`
- Go to github actions and view the `push to docker` action to see if everything ran correctly.

## Testing

### Tools

- [VS Code](https://code.visualstudio.com/) - development environment
- [Jest](https://jestjs.io/) - component testing

### Test levels

- Component tests - testing each component in isolation
  - Run tests with coverage `pnpm run-script test:coverage`
- UI E2E tests - test are part of [this repository](https://github.com/alkem-io/test-suites/tree/develop/test/functional/e2e)
