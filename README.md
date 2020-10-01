Build Quality:
[![BCH compliance](https://bettercodehub.com/edge/badge/cherrytwist/Client.Web?branch=develop)](https://bettercodehub.com/)


# Cherrytwist Web Client

This is a simple React web client for interacting with a Cherrytwist server.

It is in part inspired by the following article: https://blog.logrocket.com/build-a-graphql-react-app-with-typescript/

The intention is that this repository contains over time a selection of React components for working with Cherrytwist instances, as well as a sample web client that uses those components.

## Configure data source endpoint

Data is fed into the client through a graphql endpoint. Endpoint url is configured via the REACT_APP_GRAPHQL_ENDPOINT environment variable. Add an .env file in project's root folder and set the variable to point to the graphql server

## Configure authentication

TBD

## Extending

To extend the set of components:

- create a new folder per component
- modify the query in the new component folder
- regenerate the graphql related code by running 'npm codegen'
- finish the component
- launch!

## Launching the client Scripts

In the project directory, you can run:

- `npm install`
- `npm start`

This runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

## Known issues

-

## Development stack

The client development stack includes:

- [React documentation](https://reactjs.org/).
- Typescript
- Apollo Client

For Typescript, the Javascript generated is ES2016.

## Supported web browsers

The Javascript generated is ES2016, which is widely supported.

In addition the client looks to support the primary web browsers active in the market i.e. Edge, Chrome, Mozilla etc. Details of what versions are supported are in the package.json file.

## React Web App Framework

The project is created using the React Web App framework, and still leverages that infrastructure for builds etc. Additional build targets provided from this framework are shown below.

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Docker

The repo is also set up to generate a Docker image.

- To create the docker image: `docker build -t cherrytwist/client-web:[tag]` where [tag] can be any value
- To add build arguments - docker build --build-arg [argument]=[value]
  - Argument can be one of the following: ARG_GRAPHQL_ENDPOINT, ARG_AUTHENTICATION_ENABLE, ARG_AUTH_CLIENT_ID, ARG_AUTH_TENANT_ID, ARG_AUTH_API_SCOPE, ARG_AUTH_REDIRECT_URI
- To run a container based on the image: `docker container run -p 80:80 cherrytwist/client-web:[tag]` and then navigate with a browser to `http://localhost:80`
