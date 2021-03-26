<p align="center">
  <a href="http://cherrytwist.org/" target="blank"><img src="https://cherrytwist.org/wp-content/uploads/2020/10/cherrytwist-2.png" width="240" alt="Cherrytwist Logo" /></a>
</p>
<p align="center"><i>Enabling society to collaborate. Building a better future, together.</i></p>

![AKS dev CI/CD pipeline](https://github.com/cherrytwist/Client.Web/workflows/AKS%20dev%20CI/CD%20pipeline/badge.svg?branch=develop)
[![Coverage Status](https://coveralls.io/repos/github/cherrytwist/Client.Web/badge.svg?branch=develop)](https://coveralls.io/github/cherrytwist/Client.Web?branch=develop)
[![BCH compliance](https://bettercodehub.com/edge/badge/cherrytwist/Client.Web?branch=develop)](https://bettercodehub.com/)

# Cherrytwist Web Client

Welcome to the Cherrytwist web client - allowing you to browse the contents of an Ecoverse. Please see the [Cherrytwist repository](../cherrytwist) for more details on the Cherrytwist platform.

This client is based on React, and is intended to showcase how clients in general can interact with the domain model exposed by the [Cherrytwist server](../server).

While this client is a fully self-contained single page application, it also has a set of React components that can be used by other React applications for working with the Cherrytwist server.

## Configuration

The primary configuration needed is the location of the Cherrytwist server.

The endpoint url is configured via the `REACT_APP_GRAPHQL_ENDPOINT` environment variable. Add an .env.local file in project's root folder and set the variable to point to the graphql server.

All further configuration is obtained from the server configuration graphql schema.

## Launching the client Scripts

In the project directory, you can run:

- `npm install`
- `npm start`

This runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

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

- To create the docker image: `docker build -t cherrytwist/client-web:[tag]` where [tag] can be any value
- To add build arguments - docker build --build-arg [argument]=[value]
  - Argument can be the following: ARG_GRAPHQL_ENDPOINT
- To run a container based on the image: `docker container run -p 80:80 cherrytwist/client-web:[tag]` and then navigate with a browser to `http://localhost:80`

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
- [Protractor](https://www.protractortest.org/#/) - UI E2E testing

### Test levels

- Component tests - testing each component in isolation
  - Run tests with coverage `npm run-script test:coverage`
- UI E2E tests - testing main business flows
  - Tests are running against OS: Ubuntu, Browser: Firefox
  - Before running the tests execute the following command `npm webdriver-manager update`
  - Run tests with coverage `npm run-script test:ui`
  - Password for admin user must be provided in `conf.js` file
