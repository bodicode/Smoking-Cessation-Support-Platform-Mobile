import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import Toast from "react-native-toast-message";

const httpLink = new HttpLink({
  uri: "http://10.0.2.2:3000/graphql",
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
    console.log("[Apollo] Network Error:", networkError);
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
