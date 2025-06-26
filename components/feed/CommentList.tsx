import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { FeedService } from "@/services/newFeedService";
import { Ionicons } from "@expo/vector-icons";
import { Comment } from "@/types/api/comment";

type CommentListProps = {
  postId: string;
};

export default function CommentList({ postId }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await FeedService.getPostComments(postId, {
        page: 1,
        limit: 10,
      });
      setComments(res.data || []);
    } catch (e) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color="#16F2A8" size="large" />
      </View>
    );

  if (comments.length === 0)
    return (
      <View style={styles.stateContainer}>
        <Ionicons
          name="chatbubble-ellipses-outline"
          size={48}
          color="#c3c8d2"
        />
        <Text style={styles.emptyText}>Chưa có bình luận</Text>
      </View>
    );

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <CommentCard comment={item} />}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}

function CommentCard({
  comment,
  level = 0,
}: {
  comment: Comment;
  level?: number;
}) {
  const avatar = comment.user.avatar_url;
  return (
    <View
      style={[
        styles.card,
        level > 0 && {
          marginLeft: 24 * level,
          backgroundColor: "#F8FAFB",
        },
      ]}
    >
      {/** Avatar và thông tin user */}
      <View style={styles.row}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Ionicons name="person-circle-outline" size={40} color="#d3d6dc" />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.name}>{comment.user.name}</Text>
            <Text style={styles.time}>{formatTime(comment.created_at)}</Text>
          </View>
          <Text style={styles.content}>{comment.content}</Text>
        </View>
      </View>
      {/* Replies lồng nhau */}
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.replyWrap}>
          {comment.replies.map((reply) => (
            <CommentCard key={reply.id} comment={reply} level={level + 1} />
          ))}
        </View>
      )}
    </View>
  );
}

function formatTime(str: string) {
  const d = new Date(str);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    opacity: 0.95,
  },
  emptyText: {
    color: "#a6b0be",
    fontSize: 16,
    marginTop: 10,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 32,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 13,
    marginBottom: 14,
    shadowColor: "#6e6e6e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f2f4f6",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
    marginRight: 10,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    gap: 8,
  },
  name: {
    fontWeight: "700",
    fontSize: 16,
    color: "#253053",
    marginRight: 7,
    letterSpacing: 0.2,
  },
  time: {
    color: "#AEB4C3",
    fontSize: 12,
    fontWeight: "400",
    marginLeft: 8,
    marginTop: 2,
  },
  content: {
    fontSize: 15.5,
    color: "#29314f",
    marginTop: 2,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: 0.05,
  },
  replyWrap: {
    marginTop: 10,
    marginLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#e7e9ee",
    paddingLeft: 12,
  },
});
