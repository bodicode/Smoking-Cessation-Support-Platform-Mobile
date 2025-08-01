import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

const GRAPHQL_URI = "https://minhphuoc.io.vn/graphql";

const httpLink = new HttpLink({
  uri: GRAPHQL_URI,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem("access_token");
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.message.includes("Invalid or expired token")) {
        AsyncStorage.removeItem("access_token").then(() => {
          Toast.show({
            type: "info",
            text1: "Phiên đã hết hạn!",
            text2: "Mời bạn đăng nhập lại.",
          });
          router.replace("/(auth)/login");
        });
        break;
      }
    }
  }

  if (networkError) {
    return;
  }
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: GRAPHQL_URI.replace("http", "ws"),
    connectionParams: async () => {
      const token = await AsyncStorage.getItem("access_token");
      return {
        Authorization: token ? `Bearer ${token}` : "",
      };
    },
  })
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache(),
});

export default client;
