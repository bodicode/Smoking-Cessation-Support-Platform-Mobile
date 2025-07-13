import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import COLORS from "@/constants/Colors";

interface StageInput {
  title: string;
  start_date: string;
  end_date: string;
  actions: string;
  description: string;
  stage_order: number;
}

interface StageModalFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  initialData?: StageInput;
  isEditing: boolean;
  stageInput: StageInput;
  setStageInput: React.Dispatch<React.SetStateAction<StageInput>>;
}

const StageModalForm: React.FC<StageModalFormProps> = ({
  visible,
  onClose,
  onSubmit,
  isEditing,
  stageInput,
  setStageInput,
}) => {
  const handleInternalSubmit = () => {
    if (
      !stageInput.title ||
      !stageInput.start_date ||
      !stageInput.end_date ||
      !stageInput.actions ||
      stageInput.stage_order === 0
    ) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ các trường bắt buộc."
      );
      return;
    }

    if (
      isNaN(new Date(stageInput.start_date).getTime()) ||
      isNaN(new Date(stageInput.end_date).getTime())
    ) {
      Alert.alert(
        "Lỗi ngày",
        "Định dạng ngày không hợp lệ. Vui lòng sử dụng YYYY-MM-DD."
      );
      return;
    }

    if (new Date(stageInput.start_date) > new Date(stageInput.end_date)) {
      Alert.alert("Lỗi ngày", "Ngày bắt đầu phải trước ngày kết thúc.");
      return;
    }

    onSubmit();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.modalTitle}>
            {isEditing ? "Chỉnh sửa giai đoạn" : "Tạo giai đoạn mới"}
          </Text>

          <TextInput
            placeholder="Tên giai đoạn"
            value={stageInput.title}
            onChangeText={(text) =>
              setStageInput({ ...stageInput, title: text })
            }
            style={styles.inputStyle}
            placeholderTextColor={COLORS.light.PLACEHOLDER}
          />
          <TextInput
            placeholder="Ngày bắt đầu (yyyy-mm-dd)"
            value={stageInput.start_date}
            onChangeText={(text) =>
              setStageInput({ ...stageInput, start_date: text })
            }
            style={styles.inputStyle}
            placeholderTextColor={COLORS.light.PLACEHOLDER}
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            placeholder="Ngày kết thúc (yyyy-mm-dd)"
            value={stageInput.end_date}
            onChangeText={(text) =>
              setStageInput({ ...stageInput, end_date: text })
            }
            style={styles.inputStyle}
            placeholderTextColor={COLORS.light.PLACEHOLDER}
            keyboardType="numbers-and-punctuation"
          />
          <TextInput
            placeholder="Mô tả giai đoạn"
            value={stageInput.description}
            onChangeText={(text) =>
              setStageInput({ ...stageInput, description: text })
            }
            style={styles.inputStyle}
            multiline
            numberOfLines={3}
            placeholderTextColor={COLORS.light.PLACEHOLDER}
          />
          <TextInput
            placeholder="Hành động (ví dụ: Giảm 5 điếu/ngày)"
            value={stageInput.actions}
            onChangeText={(text) =>
              setStageInput({ ...stageInput, actions: text })
            }
            style={styles.inputStyle}
            placeholderTextColor={COLORS.light.PLACEHOLDER}
          />
          <TextInput
            placeholder="Thứ tự giai đoạn (ví dụ: 1, 2, 3)"
            value={stageInput.stage_order?.toString() ?? ""}
            onChangeText={(text) =>
              setStageInput({ ...stageInput, stage_order: parseInt(text) || 0 })
            }
            keyboardType="numeric"
            style={styles.inputStyle}
            placeholderTextColor={COLORS.light.PLACEHOLDER}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: COLORS.light.LIGHT_GREY_BG },
              ]}
              onPress={onClose}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  { color: COLORS.light.DARK_GREY_TEXT },
                ]}
              >
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: COLORS.light.PRIMARY_BLUE },
              ]}
              onPress={handleInternalSubmit}
            >
              <Text style={styles.modalButtonText}>
                {isEditing ? "Cập nhật" : "Tạo"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    elevation: 10,
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.light.DARK_TEXT,
    marginBottom: 20,
    textAlign: "center",
  },
  inputStyle: {
    height: 50,
    borderColor: COLORS.light.BORDER,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: COLORS.light.DARK_TEXT,
    backgroundColor: COLORS.light.WHITE,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.light.WHITE,
  },
});

export default StageModalForm;
