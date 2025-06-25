import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  Platform,
  TouchableOpacity,
} from "react-native";
import { BlogService } from "@/services/blogService";
import { Blog } from "@/types/api/blog";
import HTMLView from "react-native-htmlview";
import HomeHeader from "@/components/home/header";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BlogService.getBlogs()
      .then((res) => setBlogs(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <HomeHeader user={user} />

      <FlatList
        data={blogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.86}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/blog/[slug]",
                params: { slug: item.slug },
              })
            }
          >
            <Image
              source={{ uri: item.cover_image }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.authorRow}>
                {item.author?.avatar_url && (
                  <Image
                    source={{ uri: item.author.avatar_url }}
                    style={styles.avatar}
                  />
                )}
                <Text style={styles.author}>Tác giả: {item.author?.name}</Text>
                {item.created_at && <Text style={styles.dot}>·</Text>}
                {item.created_at && (
                  <Text style={styles.time}>{formatDate(item.created_at)}</Text>
                )}
              </View>
              {/* <HTMLView
                value={item.content}
                stylesheet={{
                  p: { ...styles.content, color: "#434343" },
                  strong: { fontWeight: "bold" },
                }}
                textComponentProps={{ numberOfLines: 2, ellipsizeMode: "tail" }}
              /> */}
              <Text
                style={styles.content}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {stripHtmlTags(item.content)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Hàm format ngày cho đẹp, ví dụ: "3 ngày trước" hoặc "10/07/2024"
function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

  if (diff < 60 * 60 * 24) return "Hôm nay";
  if (diff < 60 * 60 * 24 * 2) return "Hôm qua";
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

function stripHtmlTags(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    // shadow iOS
    shadowColor: "#2E2E4A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    // shadow Android
    elevation: 5,
    // hiệu ứng khi nhấn
    // transform: [{ scale: 0.98 }]
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 14,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#24253C",
    marginBottom: 7,
    lineHeight: 23,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  avatar: {
    width: 22,
    height: 22,
    borderRadius: 999,
    marginRight: 7,
    backgroundColor: "#EEE",
  },
  author: {
    fontSize: 14,
    color: "#757575",
  },
  dot: {
    fontSize: 16,
    color: "#A9A9A9",
    marginHorizontal: 6,
  },
  time: {
    fontSize: 13,
    color: "#B0B0B0",
  },
  content: {
    fontSize: 15,
    lineHeight: 21,
    color: "#444",
    marginTop: 2,
  },
});
