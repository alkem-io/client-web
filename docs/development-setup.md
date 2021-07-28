# Development setup

## Folder structure

```javascript
.
|__ /graphql        //  graphql files (queries, mutations, fragments)
|__ /src
    |__ /components   //  presentational components
    |__ /config       //  configuration files
    |__ /containers   //  container components
    |__ /context      //  context providers
    |__ /hooks        //  custom hooks
    |__ /i18n         //  localization
    |__ /pages        //  pages
    |__ /views        //  views - combinantion of container + presentational components.
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

### `Components` folders

[Presentational and Container Components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)

```javascript
.
|__ /src
    |__ /components       // presentational components
    |   |__ /core
    |   |   |__ /per component
    |   |   |   |__ /...
    |   |   |
    |   |   |__ index.tsx   // exports all components
    |   |
    |   |__ /composite
    |       |__ /layout       // components that creates a frame
    |       |__ /forms        // forms and forms dependant components
    |       |__ /lists
    |       |__ /grids
    |       |__ /tables (for future use)
    |       |__ /charts (for future use)
            |__ index.tsx // exports all components
    |
    |__ /containers                 // how things work
    |   |__ /users                  // example component
    |       |__ /users.graphql      // graphql queries/mutations required by the component.
    |       |__ /users.tsx          // the component
    |       |__ /users.spec.tsx     // unit tests for the component
    |__ /pages        // the page is standalone component constructed of containers/views/presentational components
    |__ /views        //

```

**If there is a component that doesn't fit any of the above to be discussed with the rest of the team.**

- **containers** - how things work
  - may contain both presentationl and contaner compnents. Don't have any markup of their own
  - provide data and behaviour to presentational or other container component
  - call actions
  - stateful
  - can work with context
  - context can be injected
  - logic should be represented as a hook (querie, mutations and custom hooks)
  - follows the entitites-actions paradigm as the rest of the components
  - possible to keep

```javascript
interface Props<TEntities, TActions> {
  entities: TEntities;
  actions: TActions;
}

interface Entities {
  users: UserModel[];
}

interface Actions {
  onDelete?: () => void;
}

interface UserProps extends Props<Entities, Actions> {}

interface CompositeEntities extends Entities {}
```

- **core**

  - atomic components.
  - Contextual independant.
  - stateless, except internal UI satate.
  - receive data and callbacks exclusibely from props.

- **pages**

  - standalone - always rendered as single component. Almost always used as route render component.

- **layout**

  - frame components
  - responsive

- **forms**

  - forms definitions
  - forms related components - core form components aware of the form state.

- **lists, grids, tables, charts** - composite components

- **views** - combination of containers and presentational components

### Providers

TBD
