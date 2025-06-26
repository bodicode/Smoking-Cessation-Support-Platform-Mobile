// import { ApolloClient, InMemoryCache } from "@apollo/client";

// const client = new ApolloClient({
//   uri: "http://10.0.2.2:3000/graphql",
//   cache: new InMemoryCache(),
// });

// export default client;

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const httpLink = new HttpLink({
  uri: "http://10.0.2.2:3000/graphql", // Sửa URL API của bạn
});

const authLink = setContext(async (_, { headers }) => {
  // Lấy token từ AsyncStorage, hoặc SecureStore, hoặc Redux tuỳ bạn lưu
  const token = await AsyncStorage.getItem("access_token");
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const client = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
