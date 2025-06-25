import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://10.0.2.2:3000/graphql",
  cache: new InMemoryCache(),
});

console.log(process.env.API_URL);

export default client;
