import {
  ApolloClient,
  InMemoryCache,
  gql,
  createHttpLink,
  NormalizedCacheObject
} from '@apollo/client';

// Need to overload the fetch method as not running in a browser
import fetch from 'node-fetch';


const main = async () => {
  try {

    // Instantiate required constructor fields
    const cache = new InMemoryCache();
    const link = createHttpLink({
      uri: 'http://localhost:4000/graphql',
      fetch: fetch, // overload fetch!
    });


    const client = new ApolloClient({
      cache: cache,
      link: link,
    });


    console.log('Starting up GraphQL connection');

    const result = await client.query({
      query: gql`
        query {
          allUsers {
              id
              name
          }
        }
      `
    });
    console.log(result.data);
  } catch (error) {
    console.log('Unfortunately we had an error');
    console.log(error);
  }
}

main().then(()=>{
  console.log('Client: connection complete...');
  process.exit();
}).catch(function(e){
  throw e;
});

