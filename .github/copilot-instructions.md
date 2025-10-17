# Project Overview

## Folder Structure

- `/src`: Contains the source code for the frontend.
- `/docs`: Contains documentation for the project, including API specifications and user guides.

## Libraries and Frameworks

- React and MUI for the frontend.

## Coding Standards

- Use semicolons at the end of each statement.
- Use single quotes for strings.
- Use function based components in React.
- Use arrow functions for callbacks.

## UI guidelines

## Graphql

- the schema is defined in `./src/core/apollo/generated/graphql-schema.ts`
- the generated hooks are defined in `./src/core/apollo/generated/apollo-hooks.ts`
- when using the schema DO NOT read the entire file, because is very large, instead search for the types you need.
- after making changes to graphql queries or mutations, run `npm run codegen` to update the types.

## Translations

- Translation files are located in `/src/core/i18n/{language}/translation.{language}.json`
- English (`en`) is the source of truth
- For AI-assisted translations, see `.github/alkemio-translate.md`
- Use `@workspace /alkemio.translate` to invoke the translation agent
