# Development setup

## Folder structure

```javascript
.
|__ /graphql        //  graphql files (queries, mutations, fragments)
|__ /src
    |__ /components   //  core and shared components
    |__ /config       //  configuration files
    |__ /context      //  context providers
    |__ /hooks        //  custom hooks
    |__ /i18n         //  localization
    |__ /pages        //  pages/views
    |__ /routing      //  routing components - move to components
    |__ /services     //  plain typescript modules
    |__ /store        //  Redux reducers/actions ?? x-state??/
    |__ /styles       //  to be removed
    |__ /themes       //  theme(s) defenition
    |__ /types        //
    |__ /utils        //  utils/helper funtions
    |__ root.tsx      //  setup application sceleton
    |__ index.tsx     //  entry point
```

### `Components` folder structure

[Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

```javascript
.
|__ /src
    |__ /components
        |__ /containers                 // how things work
        |   |__ /users                  // example component
        |       |__ /users.graphql      // graphql queries/mutations required by the component.
        |       |__ /users.tsx          // the component
        |       |__ /users.spec.tsx     // unit tests for the component
        |__ /pages            // the page is standalone component constructed of containers/views/presentational components
        |__ /presentation     // how things look
            |__ /core         // presentational core components - atomic pieces contextual independant.
            |__ /composite    // does not have dependency on container components. Contains one or more core components.
                |__ /layout   // components that creates a frame. they are responsive. Aware of resolution, scroll etc.
                |__ /forms    // forms and forms dependant components
                |__ /lists
                |__ /grids
                |__ /tables (for future use)
                |__ /charts (for future use)


```

**If there is a component that doesn't fit any of the above to be discussed with the rest of the team.**

### Container components

### Providers
