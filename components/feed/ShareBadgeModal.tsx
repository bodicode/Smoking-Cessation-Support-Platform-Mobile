import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Image,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface Badge {
  id: string;
  name: string;
  icon_url: string;
}

interface UserBadge {
  id: string;
  badge: Badge;
}

interface ShareBadgeModalProps {
  visible: boolean;
  onClose: () => void;
  userBadges: UserBadge[];
  onShare: (userBadgeId: string, caption: string) => void;
  loading: boolean;
}

const ShareBadgeModal: React.FC<ShareBadgeModalProps> = ({
  visible,
  onClose,
  userBadges,
  onShare,
  loading,
}) => {
  const [caption, setCaption] = useState("");
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const captionInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) {
      setCaption("");
      setSelectedBadgeId(null);
      captionInputRef.current?.blur();
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      const timeout = setTimeout(() => {
        captionInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const handleSharePress = () => {
    if (selectedBadgeId && caption.trim()) {
      onShare(selectedBadgeId, caption.trim());
    }
  };

  const handleClose = () => {
    onClose();
  };

  const renderBadgeItem = ({ item }: { item: UserBadge }) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.badgeItem,
        selectedBadgeId === item.id && styles.badgeItemSelected,
      ]}
      onPress={() => setSelectedBadgeId(item.id)}
    >
      {item.badge.icon_url ? (
        <Image source={{ uri: item.badge.icon_url }} style={styles.badgeIcon} />
      ) : (
        <Ionicons name="trophy-outline" size={30} color="#557" />
      )}
      <Text style={styles.badgeName}>{item.badge.name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Chia sẻ thành tích</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#212936" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Chọn huy hiệu:</Text>
          <View style={styles.badgeListContainer}>
            {userBadges.length > 0 ? (
              <FlatList
                horizontal
                data={userBadges}
                renderItem={renderBadgeItem}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.badgeListContent}
              />
            ) : (
              <Text style={styles.noBadgesText}>
                Bạn chưa có huy hiệu nào để chia sẻ.
              </Text>
            )}
          </View>

          <Text style={styles.label}>Nội dung bài viết:</Text>
          <TextInput
            ref={captionInputRef}
            style={styles.captionInput}
            placeholder="Bạn muốn chia sẻ điều gì?"
            placeholderTextColor="#889"
            multiline
            value={caption}
            onChangeText={setCaption}
            editable={!loading}
          />

          <TouchableOpacity
            style={[
              styles.shareButton,
              !selectedBadgeId || !caption.trim() || loading
                ? styles.shareButtonDisabled
                : {},
            ]}
            onPress={handleSharePress}
            disabled={!selectedBadgeId || !caption.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.shareButtonText}>Chia sẻ</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    minHeight: height * 0.4,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2fb",
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1E2944",
  },
  closeButton: {
    padding: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212936",
    marginBottom: 12,
    marginTop: 15,
  },
  badgeListContainer: {
    marginBottom: 20,
  },
  badgeListContent: {
    paddingRight: 10,
  },
  badgeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#eef2fb",
    backgroundColor: "#FAFDFF",
    marginRight: 10,
  },
  badgeItemSelected: {
    borderColor: "#16F2A8",
    backgroundColor: "#EAFBF3",
  },
  badgeIcon: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#212936",
  },
  noBadgesText: {
    fontStyle: "italic",
    color: "#A6B0C1",
    textAlign: "center",
    paddingVertical: 10,
  },
  captionInput: {
    minHeight: 100,
    maxHeight: 200,
    backgroundColor: "#FAFDFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#eef2fb",
    padding: 15,
    fontSize: 16,
    color: "#212936",
    textAlignVertical: "top",
    lineHeight: 22,
  },
  shareButton: {
    backgroundColor: "#16F2A8",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#16F2A8",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  shareButtonDisabled: {
    backgroundColor: "#C4E7DD",
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.5,
  },
});

export default ShareBadgeModal;
