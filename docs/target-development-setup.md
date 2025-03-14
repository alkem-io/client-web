# Development setup

## Folder structure

```javascript
.
|__ /src
  |__ /common
    |__ /components
      |__ /composite
          |__ /core
    |__ /constants
    |__ /icons
    |__ /styles
    |__ /themes
    |__ /utils
  |__ /core
    |__ /apollo
    |__ /auth
    |__ /i18n
    |__ /state
  |__ /config
  |__ /services
  |__ /types
  |__ /config
    |__ root.tsx
    |__ index.tsx
```

The goal here is to make a more hierarchical, domain-driven-design (DDD) structure, and group things by domain under src/domain as much as possible, iteratively. Only core and shared application building blocks should live on the same level as src/domain.

## Domain folders

```javascript
.
|__ /src
    |__ /domain
    |   |__ /space (or any other entity)
    |   |   |__ /context
    |   |   |__ /graphql
    |   |   |__ /hooks
    |   |   |__ /layout
    |   |   |__ /pages
    |   |   |__ /routing
    |   |   |__ /views
```

The goal (next steps) here is the move each domain entity also into a more domain-driven-design and not group per functional class, e.g. group all queries + context + hooks etc. (building blocks) of e.g. Challenge Authorization in one folder
