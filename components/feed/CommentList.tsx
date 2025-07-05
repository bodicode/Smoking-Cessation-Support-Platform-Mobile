import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FeedService } from "@/services/newFeedService";
import { Ionicons } from "@expo/vector-icons";
import { Comment } from "@/types/api/comment";
import Toast from "react-native-toast-message";
import { useAuth } from "@/contexts/AuthContext";

type CommentInputProps = {
  postId: string;
  onCommentAdded: (newComment: Comment) => void;
  replyingToUser?: { id: string; name: string } | null;
  onCancelReply?: () => void;
};

const CommentInput = React.forwardRef<TextInput, CommentInputProps>(
  ({ postId, onCommentAdded, replyingToUser, onCancelReply }, ref) => {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (replyingToUser && ref && "current" in ref) {
        ref.current?.focus();
      }
    }, [replyingToUser, ref]);

    const handleAddComment = async () => {
      if (content.trim() === "") {
        Alert.alert("Lỗi", "Nội dung bình luận không được để trống.");
        return;
      }

      setLoading(true);
      try {
        const newCommentFromApi = await FeedService.addComment({
          shared_post_id: postId,
          content: content,
          parent_comment_id: replyingToUser?.id || null,
        });

        if (newCommentFromApi) {
          const newComment: Comment = {
            ...newCommentFromApi,
            user: {
              ...newCommentFromApi.user,
              avatar_url: null,
            },
            replies: [],
          };

          onCommentAdded(newComment);
          setContent("");
          Toast.show({
            type: "success",
            text1: "Bình luận thành công!",
          });

          if (onCancelReply) {
            onCancelReply();
          }
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        Toast.show({
          type: "error",
          text1: "Không thể thêm bình luận",
          text2: "Đã xảy ra lỗi. Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <View style={commentInputStyles.container}>
        {replyingToUser && (
          <View style={commentInputStyles.replyingToContainer}>
            <Text style={commentInputStyles.replyingToText}>
              Đang trả lời{" "}
              <Text style={{ fontWeight: "700" }}>@{replyingToUser.name}</Text>
            </Text>
            <TouchableOpacity onPress={onCancelReply}>
              <Ionicons name="close-circle" size={20} color="#a6b0be" />
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          ref={ref}
          style={commentInputStyles.input}
          placeholder={
            replyingToUser
              ? `Trả lời @${replyingToUser.name}...`
              : "Viết bình luận..."
          }
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          multiline
          editable={!loading}
        />
        <TouchableOpacity
          style={commentInputStyles.sendButton}
          onPress={handleAddComment}
          disabled={loading || content.trim() === ""}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    );
  }
);

const addReplyToCommentTree = (
  comments: Comment[],
  newReply: Comment
): Comment[] => {
  return comments.map((comment) => {
    if (comment.id === newReply.parent_comment_id) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToCommentTree(comment.replies, newReply),
      };
    }
    return comment;
  });
};

const updateCommentInTree = (
  comments: Comment[],
  updatedComment: Comment
): Comment[] => {
  return comments.map((comment) => {
    if (comment.id === updatedComment.id) {
      return { ...comment, content: updatedComment.content };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: updateCommentInTree(comment.replies, updatedComment),
      };
    }
    return comment;
  });
};

const removeCommentFromTree = (
  comments: Comment[],
  commentIdToRemove: string
): Comment[] => {
  return comments.filter((comment) => {
    if (comment.id === commentIdToRemove) {
      return false;
    }
    if (comment.replies && comment.replies.length > 0) {
      comment.replies = removeCommentFromTree(
        comment.replies,
        commentIdToRemove
      );
    }
    return true;
  });
};

type CommentListProps = {
  postId: string;
};

export default function CommentList({ postId }: CommentListProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingToComment, setReplyingToComment] = useState<Comment | null>(
    null
  );
  const commentInputRef = useRef<TextInput>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await FeedService.getPostComments(postId, {
        page: 1,
        limit: 10,
      });
      setComments(res.data || []);
    } catch (e) {
      throw e;
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const onCommentAdded = useCallback((newComment: Comment) => {
    if (newComment.parent_comment_id) {
      setComments((prevComments) =>
        addReplyToCommentTree(prevComments, newComment)
      );
    } else {
      setComments((prevComments) => [newComment, ...prevComments]);
    }
  }, []);

  const handleReplyClick = useCallback((comment: Comment) => {
    setReplyingToComment(comment);
    commentInputRef.current?.focus();
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingToComment(null);
  }, []);

  const handleEditClick = useCallback((comment: Comment) => {
    setEditingComment(comment);
    setEditedContent(comment.content);
    setIsEditModalVisible(true);
  }, []);

  const handleSaveEdit = async () => {
    if (!editingComment || editedContent.trim() === "") return;

    setIsEditingLoading(true);
    try {
      const updatedComment = await FeedService.updateComment(
        editingComment.id,
        editedContent
      );

      if (updatedComment) {
        setComments((prevComments) =>
          updateCommentInTree(prevComments, updatedComment)
        );
        Toast.show({
          type: "success",
          text1: "Cập nhật thành công!",
          text2: "Bình luận của bạn đã được chỉnh sửa.",
        });
      }
      setIsEditModalVisible(false);
      setEditingComment(null);
      setEditedContent("");
    } catch (error) {
      console.error("Error saving comment edit:", error);
      Toast.show({
        type: "error",
        text1: "Cập nhật thất bại",
        text2: "Không thể lưu chỉnh sửa. Vui lòng thử lại.",
      });
    } finally {
      setIsEditingLoading(false);
    }
  };

  const handleDeleteClick = useCallback((commentId: string) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa bình luận này không? Hành động này không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            setDeletingCommentId(commentId);
            try {
              const result = await FeedService.deleteComment(commentId);
              if (result && result.is_deleted) {
                setComments((prevComments) =>
                  removeCommentFromTree(prevComments, commentId)
                );
                Toast.show({
                  type: "success",
                  text1: "Đã xóa bình luận!",
                  text2: "Bình luận của bạn đã được gỡ bỏ.",
                });
              } else {
                throw new Error("Deletion response indicates failure.");
              }
            } catch (error) {
              console.error("Failed to delete comment:", error);
              Toast.show({
                type: "error",
                text1: "Xóa thất bại",
                text2: "Đã xảy ra lỗi. Vui lòng thử lại.",
              });
            } finally {
              setDeletingCommentId(null);
            }
          },
        },
      ]
    );
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  if (loading)
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator color="#16F2A8" size="large" />
      </View>
    );

  const renderCommentInput = () => (
    <CommentInput
      ref={commentInputRef}
      postId={postId}
      onCommentAdded={onCommentAdded}
      replyingToUser={replyingToComment?.user}
      onCancelReply={handleCancelReply}
    />
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
        {renderCommentInput()}
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CommentCard
            comment={item}
            onReply={handleReplyClick}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            currentUser={user}
            isDeleting={deletingCommentId === item.id}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      {renderCommentInput()}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.editModalContent}>
            <Text style={styles.editModalTitle}>Chỉnh sửa bình luận</Text>
            <TextInput
              style={styles.editInput}
              value={editedContent}
              onChangeText={setEditedContent}
              placeholder="Nhập nội dung mới..."
              multiline
              textAlignVertical="top"
              editable={!isEditingLoading}
            />
            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={[styles.editButtonModal, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isEditingLoading}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editButtonModal, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={isEditingLoading || editedContent.trim() === ""}
              >
                {isEditingLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Lưu</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

type CommentCardProps = {
  comment: Comment;
  level?: number;
  onReply: (comment: Comment) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  currentUser: any;
  isDeleting: boolean;
};

function CommentCard({
  comment,
  level = 0,
  onReply,
  onEdit,
  onDelete,
  currentUser,
  isDeleting,
}: CommentCardProps) {
  if (!comment || !comment.user) {
    console.warn("Dữ liệu comment hoặc user bị thiếu. Bỏ qua render.", comment);
    return null;
  }

  const avatar = comment.user?.avatar_url;
  const userName = comment.user?.name || "Người dùng ẩn danh";
  const isMyComment = currentUser?.id === comment.user.id;

  return (
    <View
      style={[
        styles.card,
        level > 0 && {
          marginLeft: 24 * level,
          backgroundColor: "#F8FAFB",
          borderTopLeftRadius: 0,
        },
      ]}
    >
      {level > 0 && (
        <View style={[styles.replyLine, { height: 13 + level * 2 }]} />
      )}
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
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.time}>{formatTime(comment.created_at)}</Text>
          </View>
          <Text style={styles.content}>{comment.content}</Text>
          <View style={styles.actionBar}>
            <View style={styles.actionsLeft}>
              {level === 0 && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onReply(comment)}
                >
                  <Ionicons name="arrow-undo-outline" size={14} color="#666" />
                  <Text style={styles.actionText}>Trả lời</Text>
                </TouchableOpacity>
              )}
            </View>
            {isMyComment && (
              <View style={styles.actionsRight}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit(comment)}
                >
                  <Ionicons name="create-outline" size={14} color="#3498db" />
                  <Text style={[styles.actionText, { color: "#3498db" }]}>
                    Sửa
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDelete(comment.id)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#e74c3c" />
                  ) : (
                    <>
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#e74c3c"
                      />
                      <Text style={[styles.actionText, { color: "#e74c3c" }]}>
                        Xóa
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.replyWrap}>
          {comment.replies.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              level={level + 1}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUser={currentUser}
              isDeleting={isDeleting}
            />
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
    flex: 1,
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
    position: "relative",
  },
  replyLine: {
    position: "absolute",
    left: -20,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#e7e9ee",
    borderRadius: 1,
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
    flexDirection: "column",
    alignItems: "flex-start",
    marginBottom: 2,
    gap: 2,
  },
  name: {
    fontWeight: "700",
    fontSize: 16,
    color: "#253053",
    letterSpacing: 0.2,
  },
  time: {
    color: "#AEB4C3",
    fontSize: 12,
    fontWeight: "400",
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
    paddingLeft: 12,
  },
  actionBar: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionsLeft: {
    flexDirection: "row",
    gap: 15,
  },
  actionsRight: {
    flexDirection: "row",
    gap: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModalContent: {
    width: "90%",
    maxWidth: 500,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#253053",
    marginBottom: 15,
    textAlign: "center",
  },
  editInput: {
    minHeight: 120,
    maxHeight: 250,
    backgroundColor: "#f7f9fc",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    lineHeight: 22,
    borderColor: "#e3e8f0",
    borderWidth: 1,
    color: "#212936",
    marginBottom: 20,
    textAlignVertical: "top",
  },
  editModalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 15,
  },
  editButtonModal: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f4f8",
    borderWidth: 1,
    borderColor: "#e3e8f0",
  },
  saveButton: {
    backgroundColor: "#16F2A8",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#fff",
  },
});

const commentInputStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sendButton: {
    width: 44,
    height: 44,
    marginLeft: 10,
    backgroundColor: "#16F2A8",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16F2A8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  replyingToContainer: {
    position: "absolute",
    bottom: "100%",
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F0F8FF",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#e7e9ee",
    elevation: 1,
    zIndex: 1,
  },
  replyingToText: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
  },
});
