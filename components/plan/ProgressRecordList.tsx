import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import COLORS from "@/constants/Colors";

import { IProgressRecord } from "@/types/api/processRecord";
import { ProgressRecordService } from "@/services/processRecordService";
import ProgressRecordForm from "./ProgressRecordForm";

export default function ProgressRecordsList({
  planId,
  refreshKey,
  onRecordsUpdated,
  coachId,
}: {
  planId: string;
  refreshKey?: number;
  onRecordsUpdated?: () => void;
  coachId: string;
}) {
  const [records, setRecords] = useState<IProgressRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<IProgressRecord | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProgressRecordService.getRecords({
        params: {
          limit: 20,
          page: 1,
          orderBy: "record_date",
          sortOrder: "desc",
        },
        filters: { planId: planId },
      });
      setRecords(data || []);
    } catch (e: any) {
      setError("Không thể tải bản ghi. Vui lòng thử lại.");
      Toast.show({ type: "error", text1: "Không thể tải bản ghi" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) {
      fetchRecords();
    } else {
      setLoading(false);
      setError("Không có kế hoạch cai thuốc được chọn.");
    }
  }, [planId, refreshKey]);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Xác nhận xoá",
      "Bạn có chắc chắn muốn xoá bản ghi này không? Hành động này không thể hoàn tác.",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xoá",
          onPress: () => confirmAndDelete(id),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const confirmAndDelete = async (id: string) => {
    try {
      await ProgressRecordService.deleteRecord(id);
      Toast.show({ type: "success", text1: "Đã xoá bản ghi thành công!" });
      fetchRecords();
      if (onRecordsUpdated) {
        onRecordsUpdated();
      }
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Xoá thất bại",
        text2: "Vui lòng thử lại.",
      });
    }
  };

  const openEdit = (record: IProgressRecord) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleFormSubmissionSuccess = () => {
    setModalVisible(false);
    fetchRecords();
    if (onRecordsUpdated) {
      onRecordsUpdated();
    }
    if (onRecordsUpdated) {
      onRecordsUpdated();
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.light.ACTIVE} />
        <Text style={styles.loadingText}>Đang tải bản ghi...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.flatListContentContainer}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardDateContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={COLORS.light.GRAY}
                />
                <Text style={styles.cardDateText}>
                  {formatDate(item.record_date || new Date().toISOString())}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEdit(item)}>
                  <Ionicons
                    name="pencil"
                    size={20}
                    color={COLORS.light.PRIMARY}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash" size={20} color={COLORS.light.ERROR} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <View style={styles.infoLabelContent}>
                  <Ionicons
                    name="stats-chart-outline"
                    size={18}
                    color="black"
                  />
                  <Text style={styles.infoLabelText}>Điếu đã hút:</Text>
                </View>
                <Text style={styles.valueText}>{item.cigarettes_smoked}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelContent}>
                  <Ionicons name="heart-outline" size={18} color="green" />
                  <Text style={styles.infoLabelText}>Sức khỏe:</Text>
                </View>
                <Text style={styles.valueText}>{item.health_score}/10</Text>
              </View>
              {item.notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Ghi chú:</Text>
                  <Text style={styles.notesText}>{item.notes}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.headerComponentContainer}>
            <Text style={styles.progressRecordsHeader}>Bản ghi tiến độ</Text>

            <TouchableOpacity
              style={styles.createButton}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedRecord(null);
                setModalVisible(true);
              }}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={COLORS.light.BACKGROUND}
              />
              <Text style={styles.createButtonText}>Tạo bản ghi mới</Text>
            </TouchableOpacity>

            {records.length === 0 && !loading && !error && (
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-text-outline"
                  size={60}
                  color={COLORS.light.SUBTEXT}
                />
                <Text style={styles.emptyStateText}>
                  Bạn chưa có bản ghi tiến độ nào.
                </Text>
                <Text style={styles.emptyStateSubText}>
                  Hãy tạo bản ghi đầu tiên của bạn để theo dõi hành trình!
                </Text>
              </View>
            )}
          </View>
        )}
      />
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <ProgressRecordForm
              initialData={selectedRecord || undefined}
              planId={planId}
              onSubmit={handleFormSubmissionSuccess}
              onCancel={() => setModalVisible(false)}
              coachId={coachId}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
  },
  flatListContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 0,
  },
  headerComponentContainer: {
    paddingTop: 20,
    marginBottom: 10,
  },
  progressRecordsHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
    marginBottom: 15,
    textAlign: "left",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.light.BACKGROUND,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.light.ERROR,
    textAlign: "center",
    marginHorizontal: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.light.ACTIVE,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  createButtonText: {
    color: COLORS.light.BACKGROUND,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  card: {
    backgroundColor: COLORS.light.CARD_BACKGROUND,
    padding: 18,
    marginBottom: 16,
    borderRadius: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardDateText: {
    fontSize: 14,
    color: COLORS.light.GRAY,
    fontWeight: "500",
    lineHeight: 18,
  },
  cardBody: {
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.light.BORDER,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabelContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabelText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.light.DARK_TEXT,
    lineHeight: 22,
  },
  valueText: {
    fontWeight: "bold",
    color: COLORS.light.PRIMARY,
    fontSize: 16,
  },
  notesContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.light.BORDER,
  },
  notesLabel: {
    color: COLORS.light.SUBTEXT,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  notesText: {
    color: COLORS.light.SUBTEXT,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.light.BACKGROUND,
    borderRadius: 20,
    padding: 20,
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: COLORS.light.GRAY_LIGHT,
    alignItems: "center",
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.light.DARK_TEXT,
  },
  emptyState: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 50,
    backgroundColor: COLORS.light.CARD_BACKGROUND,
    borderRadius: 15,

    marginHorizontal: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
    marginTop: 15,
    textAlign: "center",
  },
  emptyStateSubText: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});
