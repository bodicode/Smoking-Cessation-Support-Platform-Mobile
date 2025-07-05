import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { BlogService } from "@/services/blogService";
import HTMLView from "react-native-htmlview";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function BlogDetailScreen() {
  const navigation = useNavigation();
  const { slug } = useLocalSearchParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "",
      headerBackTitleVisible: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (slug) {
      BlogService.getBlogBySlug(slug as string)
        .then(setBlog)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }
  if (!blog) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy bài viết!</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      {blog.cover_image && (
        <Image
          source={{ uri: blog.cover_image }}
          style={styles.cover}
          resizeMode="cover"
        />
      )}

      <View style={styles.contentWrapper}>
        <Text style={styles.title}>{blog.title}</Text>
        <View style={styles.authorRow}>
          {blog.author?.avatar_url ? (
            <Image
              source={{ uri: blog.author.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <MaterialCommunityIcons
                name="account"
                size={22}
                color="#bdbdbd"
              />
            </View>
          )}
          <Text style={styles.author}>{blog.author?.name}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.time}>{formatDate(blog.created_at)}</Text>
        </View>

        <View style={styles.divider} />

        <HTMLView
          value={blog.content}
          stylesheet={{
            p: {
              fontSize: 17,
              color: "#232323",
              marginBottom: 16,
              lineHeight: 25,
            },
            h1: { fontSize: 23, fontWeight: "bold", marginVertical: 12 },
            h2: { fontSize: 20, fontWeight: "bold", marginVertical: 10 },
            ul: { marginBottom: 12, paddingLeft: 20 },
            li: { fontSize: 17, color: "#232323", marginBottom: 7 },
            strong: { fontWeight: "bold" },
            em: { fontStyle: "italic" },
          }}
        />
      </View>
    </ScrollView>
  );
}

function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

const CARD_RADIUS = 15;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FA",
  },
  cover: {
    width: width,
    height: width * 0.54,
    borderBottomLeftRadius: CARD_RADIUS * 1.2,
    borderBottomRightRadius: CARD_RADIUS * 1.2,
    backgroundColor: "#ececec",
    marginBottom: 6,
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 5,
  },
  contentWrapper: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
    backgroundColor: "#fff",
    marginTop: -CARD_RADIUS,
    marginHorizontal: 10,
    borderRadius: CARD_RADIUS,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
    minHeight: 180,
  },
  title: {
    fontSize: 23,
    fontWeight: "700",
    color: "#22223B",
    marginBottom: 11,
    lineHeight: 32,
    letterSpacing: 0.1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 9,
    borderWidth: 1.5,
    borderColor: "#fff",
    backgroundColor: "#eaeaea",
    shadowColor: "#232323",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 9,
    backgroundColor: "#ddd",
  },
  author: {
    fontSize: 15,
    color: "#7E8697",
    fontWeight: "600",
  },
  dot: {
    fontSize: 15,
    color: "#BBC3CF",
    marginHorizontal: 7,
    fontWeight: "bold",
  },
  time: {
    fontSize: 14,
    color: "#B0B0B0",
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F1F3",
    marginVertical: 14,
    borderRadius: 3,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4F7FA",
  },
});
