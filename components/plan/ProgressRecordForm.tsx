import {
  ICreateProgressRecordInput,
  IProgressRecord,
  IUpdateProgressRecordInput,
} from "@/types/api/processRecord";

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import COLORS from "@/constants/Colors";
import { ProgressRecordService } from "@/services/processRecordService";
import Toast from "react-native-toast-message";
import { useProgress } from "@/contexts/ProgressRecordContext";
import { useHealthScoreCriteria } from "@/services/healthScoreCriteria";
import { AntDesign } from "@expo/vector-icons";

interface ProgressRecordFormProps {
  initialData?: IProgressRecord;
  planId?: string;
  prefillDate?: Date;
  onSubmit: (record: IProgressRecord) => void;
  onCancel?: () => void;
  coachId?: string;
}

interface HealthCriteriaItem {
  id: string;
  title: string;
  description: string;
  coach_id: string;
}

const htmlToListTextForDisplay = (htmlString: string): string => {
  if (!htmlString) return "";

  let plainText = htmlString.replace(/<li>/g, "- ").replace(/<\/li>/g, "\n");

  plainText = plainText.replace(/<[^>]*>/g, "");

  return plainText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
};

export default function ProgressRecordForm({
  initialData,
  planId,
  prefillDate,
  onSubmit,
  onCancel,
  coachId,
}: ProgressRecordFormProps) {
  const { refreshData } = useProgress();

  const [cigarettesSmoked, setCigarettesSmoked] = useState<string>("");
  const [healthScore, setHealthScore] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCriteriaModal, setShowCriteriaModal] = useState(false);

  const {
    criteriaList,
    loading: criteriaLoading,
    error: criteriaError,
  } = useHealthScoreCriteria(coachId || "");

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setCigarettesSmoked(initialData.cigarettes_smoked?.toString() || "");
      setHealthScore(initialData.health_score?.toString() || "");
      setNotes(initialData.notes || "");
    } else {
      setCigarettesSmoked("");
      setHealthScore("5");
      setNotes("");
    }
  }, [initialData]);

  // Refresh data khi component mount để đảm bảo data mới nhất
  useEffect(() => {
    refreshData();
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const numCigarettes = parseInt(cigarettesSmoked, 10);
    const numHealthScore = parseInt(healthScore, 10);

    if (isNaN(numCigarettes) || numCigarettes < 0) {
      Alert.alert("Lỗi", "Số điếu thuốc không hợp lệ. Vui lòng nhập một số.");
      return;
    }
    if (isNaN(numHealthScore) || numHealthScore < 1 || numHealthScore > 10) {
      Alert.alert(
        "Lỗi",
        "Chỉ số sức khỏe không hợp lệ. Vui lòng nhập một số từ 1 đến 10."
      );
      return;
    }

    setIsSubmitting(true);

    const basePayload = {
      cigarettes_smoked: numCigarettes,
      health_score: numHealthScore,
      notes: notes.trim(),
    };

    try {
      let resultRecord: IProgressRecord;

      if (isEditing) {
        const updatePayload: IUpdateProgressRecordInput = {
          id: initialData!.id,
          ...basePayload,
        };
        resultRecord = await ProgressRecordService.updateRecord(updatePayload);
        Toast.show({
          type: "success",
          text1: "Cập nhật tiến độ thành công!",
        });
      } else {
        if (!planId) {
          Toast.show({
            type: "error",
            text1: "Lỗi khi thêm tiến độ!",
            text2: "Không tìm thấy ID kế hoạch.",
          });
          setIsSubmitting(false);
          return;
        }

        const recordDate = prefillDate
          ? prefillDate.toISOString()
          : new Date().toISOString();

        const createPayload: ICreateProgressRecordInput = {
          ...basePayload,
          plan_id: planId,
          record_date: recordDate,
        };
        resultRecord = await ProgressRecordService.createRecord(createPayload);
        Toast.show({
          type: "success",
          text1: "Đã thêm tiến độ thành công!",
        });
      }

      // Refresh toàn bộ data sau khi tạo/cập nhật bản ghi
      await refreshData();
      
      // Thêm delay nhỏ để đảm bảo data được cập nhật
      setTimeout(() => {
        refreshData();
      }, 100);
      
      onSubmit(resultRecord);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Đã xảy ra lỗi khi lưu bản ghi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isEditing ? "Chỉnh sửa bản ghi" : "Tạo bản ghi mới"}
      </Text>

      <Text style={styles.label}>Số điếu đã hút hôm nay</Text>
      <TextInput
        value={cigarettesSmoked}
        onChangeText={setCigarettesSmoked}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="VD: 5"
        placeholderTextColor={COLORS.light.PLACEHOLDER}
        editable={!isSubmitting}
      />

      <View style={styles.healthScoreRow}>
        <Text style={styles.label}>Bạn đánh giá sức khỏe hôm nay? (1-10)</Text>
        <TouchableOpacity
          onPress={() => setShowCriteriaModal(true)}
          disabled={criteriaLoading}
        >
          {criteriaLoading ? (
            <ActivityIndicator size="small" color={COLORS.light.PRIMARY} />
          ) : (
            <AntDesign
              name="questioncircleo"
              size={20}
              color={COLORS.light.PRIMARY}
            />
          )}
        </TouchableOpacity>
      </View>
      <TextInput
        value={healthScore}
        onChangeText={setHealthScore}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="10 = Rất tốt, 1 = Rất tệ"
        placeholderTextColor={COLORS.light.PLACEHOLDER}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Ghi chú</Text>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        multiline
        style={[styles.input, styles.textArea]}
        placeholder="Cảm thấy thèm thuốc vào buổi sáng..."
        placeholderTextColor={COLORS.light.PLACEHOLDER}
        editable={!isSubmitting}
      />

      <View style={styles.buttonsContainer}>
        {onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={isSubmitting}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Hủy
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.light.WHITE} />
          ) : (
            <Text style={styles.buttonText}>
              {isEditing ? "Cập nhật" : "Lưu lại"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal hiển thị tiêu chí sức khỏe */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCriteriaModal}
        onRequestClose={() => setShowCriteriaModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCriteriaModal(false)}
            >
              <AntDesign
                name="closecircleo"
                size={24}
                color={COLORS.light.DARK_GREY_TEXT}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Tiêu chí điểm sức khỏe</Text>
            {criteriaLoading ? (
              <ActivityIndicator size="large" color={COLORS.light.PRIMARY} />
            ) : criteriaError ? (
              <Text style={styles.errorText}>
                Lỗi tải tiêu chí: {criteriaError.message}
              </Text>
            ) : criteriaList.length === 0 ? (
              <Text style={styles.messageText}>
                Chưa có tiêu chí nào được thiết lập.
              </Text>
            ) : (
              <ScrollView style={styles.criteriaListContainer}>
                {criteriaList.map((item: HealthCriteriaItem) => (
                  <View key={item.id} style={styles.criteriaItem}>
                    <Text style={styles.criteriaTitle}>{item.title}</Text>
                    <Text style={styles.criteriaDescription}>
                      {htmlToListTextForDisplay(item.description)}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.light.BACKGROUND,
    borderRadius: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.light.DARK_GREY_TEXT,
    marginBottom: 8,
  },
  healthScoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.light.BORDER,
    backgroundColor: COLORS.light.WHITE,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.light.TEXT,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonsContainer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButton: {
    backgroundColor: COLORS.light.ACTIVE,
  },
  buttonText: {
    color: COLORS.light.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER,
  },
  cancelButtonText: {
    color: COLORS.light.DARK_GREY_TEXT,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.light.WHITE,
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
    marginBottom: 15,
    textAlign: "center",
  },
  criteriaListContainer: {
    flexGrow: 1,
  },
  criteriaItem: {
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER,
  },
  criteriaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY,
    marginBottom: 5,
  },
  criteriaDescription: {
    fontSize: 14,
    color: COLORS.light.TEXT,
    lineHeight: 20,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  messageText: {
    color: COLORS.light.DARK_GREY_TEXT,
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});
