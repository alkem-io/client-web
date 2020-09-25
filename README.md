# Cherrytwist Web Client

This is a simple React web client for interacting with a Cherrytwist server.

It is in part inspired by the following article: https://blog.logrocket.com/build-a-graphql-react-app-with-typescript/

The intention is that this repository contains over time a selection of React components for working with Cherrytwist instances, as well as a sample web client that uses those components.

## Configure data source endpoint

Data is fed into the client through a graphql endpoint. Endpoint url is configured via the REACT_APP_GRAPHQL_ENDPOINT environment variable. Add an .env file in project's root folder and set the variable to point to the graphql server

## Configure authentication

<details>
<summary>Register backend Azure Application</summary>

1. Navigate to the Microsoft identity platform for developers [App registrations](https://go.microsoft.com/fwlink/?linkid=2083908) page.
1. Select **New registration**.
1. When the **Register an application page** appears, enter your application's registration information:
   - In the **Name** section, enter a meaningful application name that will be displayed to users of the app, for example `ct-server`.
   - Change **Supported account types** to **Personal Microsoft accounts only**.
   - Select **Register** to create the application.
1. On the app **Overview** page, find the **Application (client) ID** value and record it for later. You'll need it to configure the configuration file for this projects.
1. From the **Certificates & secrets** page, in the **Client secrets** section, choose **New client secret**:
   - Type a key description (of instance `app secret`),
   - Select a key duration of either **In 1 year**, **In 2 years**, or **Never Expires**.
   - When you press the **Add** button, the key value will be displayed, copy, and save the value in a safe location.
   - You'll need this key later to configure the project. This key value will not be displayed again, nor retrievable by any other means,
     so record it as soon as it is visible from the Azure portal.
1. Select the **API permissions** section
   - Click the **Add a permission** button and then,
   - Ensure that the **Microsoft APIs** tab is selected
   - In the _Commonly used Microsoft APIs_ section, click on **Microsoft Graph**
   - In the **Delegated permissions** section, ensure that the right permissions are checked: **User.Read** and **offline_access**. Use the search box if necessary.
   - Select the **Add permissions** button.
1. Select the **Expose an API** section, and:
   - Click **Set** next to the Application ID URI to generate a URI that is unique for this app (in the form of `api://{clientId}`).
   - Select **Add a scope**
   - Enter the following parameters
     - for **Scope name** use `access_as_user`
     - Keep **Admins and users** for **Who can consent**
     - in **Admin consent display name** type `Access ct-server as a user`
     - in **Admin consent description** type `Accesses the ct-server Web API as a user`
     - in **User consent display name** type `Access ct-server as a user`
     - in **User consent description** type `Accesses the ct-server Web API as a user`
     - Keep **State** as **Enabled**
     - Select **Add scope**

#### Register the client Azure Application

1. Navigate to the Microsoft identity platform for developers [App registrations](https://go.microsoft.com/fwlink/?linkid=2083908) page.
1. Select **New registration**.
1. When the **Register an application page** appears, enter your application's registration information:
   - In the **Name** section, enter a meaningful application name that will be displayed to users of the app, for example `ct-web`.
   - Change **Supported account types** to **Accounts in any organizational directory and personal Microsoft accounts (e.g. Skype, Xbox, Outlook.com)**.
   - Select **Register** to create the application.
1. On the app **Overview** page, find the **Application (client) ID** value and record it for later. You'll need it to configure the configuration file for this projects.
1. From the app's Overview page, select the **Authentication** section.
   - Click **Add a platform** button.
   - Select **Single-page Applications** on the right blade.
   - Add a **Redirect URIs**, for instance `http://localhost:3000`.
   - Click **Configure**.
1. Select the **API permissions** section
   - Click the **Add a permission** button and then,
   - Ensure that the **My APIs** tab is selected
   - In the list of APIs, select the `ct-server` API, or the name you entered for the Web API
   - In the **Delegated permissions** section, ensure that the right permissions are checked: **access_as_user**. Use the search box if necessary.
   - Select the **Add permissions** button.
1. Now you need to leave the registration for `ct-web` and go back to your app registration for `ct-server`. - From the app's Overview page, select the **Manifest** section. - Find the entry for `KnownClientApplications`, and add the **Application (client) ID** of the `ct-web` application copied from the Azure portal.
i.e. `KnownClientApplications: [ "your-client-id-for-ct-web" ]`
</details>

##### Configure the client app (ct-web) to use your app registration

> In the steps below, "ClientID" is the same as "Application ID" or "AppId".

1. Open the `.env` file
1. Find the app key `REACT_APP_AUTH_CLIENT_ID` and replace the existing value with the application ID (clientId) of the `ct-web` application copied from the Azure portal.
1. Find the app key `REACT_APP_AUTH_TENANT_ID` and replace the existing value with the directory ID (tenantId) of the `ct-web` application copied from the Azure portal.
1. Find the app key `REACT_APP_AUTH_REDIRECT_URI` and replace the existing value with the base address of the ct-web project (by default `http://localhost:3000/`).
1. Find the app key `REACT_APP_AUTH_API_SCOPE` and replace the existing value with _Scope_ you created earlier `api://{client_id}/.default`.

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

To create the docker image: `docker build -t cherrytwist/client-web:0.1.1`

To run a container based on the image: `docker container run -p 80:80 cherrytwist/client-web:0.1.1`

And then navigate with a browser to `http://localhost:80`
