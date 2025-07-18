import {
  ICreateProgressRecordInput,
  IProgressRecord,
  IUpdateProgressRecordInput,
} from "@/types/api/processRecord";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import COLORS from "@/constants/Colors";
import { ProgressRecordService } from "@/services/processRecordService";
import Toast from "react-native-toast-message";
import { useProgress } from "@/contexts/ProgressRecordContext";

interface ProgressRecordFormProps {
  initialData?: IProgressRecord;
  planId?: string;
  prefillDate?: Date;
  onSubmit: (record: IProgressRecord) => void;
  onCancel?: () => void;
}

export default function ProgressRecordForm({
  initialData,
  planId,
  prefillDate,
  onSubmit,
  onCancel,
}: ProgressRecordFormProps) {
  const { refreshData } = useProgress();

  const [cigarettesSmoked, setCigarettesSmoked] = useState<string>("");
  const [healthScore, setHealthScore] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      await refreshData();
      onSubmit(resultRecord);
    } catch (error: any) {
      console.error("Lỗi khi gửi bản ghi:", error);
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

      <Text style={styles.label}>Bạn đánh giá sức khỏe hôm nay? (1-10)</Text>
      <TextInput
        value={healthScore}
        onChangeText={setHealthScore}
        keyboardType="number-pad"
        style={styles.input}
        placeholder="10 = Rất tốt, 1 = Rất tệ"
        placeholderTextColor={COLORS.light.PLACEHOLDER}
        editable={!isSubmitting}
      />

      <Text style={styles.label}>Ghi chú (Không bắt buộc)</Text>
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
});
