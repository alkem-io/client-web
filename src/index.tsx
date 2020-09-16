import React from "react";
import ReactDOM from "react-dom";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client";
import "./styles/index.css";
import App from "./components/App";

const graphQLEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'; 

const client = new ApolloClient({
  uri: graphQLEndpoint,
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
);
