import { ApolloLink } from '@apollo/client';

const omitTypename = (key: string, value: unknown) => {
  return key === '__typename' || key === '_id' || /^\$/.test(key) ? undefined : value;
};

/*
  Apollo automatically sends _typename in the query.  This causes
  a failure on the server-side because _typename is not specified
  in the schema. This middleware removes it.
*/
export const omitTypenameLink = new ApolloLink((operation, forward) => {
  // Do not clear __typename when there is a file fo upload,
  // Otherwise the JSON parse/stringify will remove the File variable
  if (operation.variables && !operation.variables.file) {
    operation.variables = JSON.parse(JSON.stringify(operation.variables), omitTypename);
  }
  return forward ? forward(operation) : null;
});
