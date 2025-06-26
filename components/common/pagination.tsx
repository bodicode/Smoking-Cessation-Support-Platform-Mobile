import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface PaginationProps {
  page: number;
  hasNext: boolean;
  onChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, hasNext, onChange }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.btn, page <= 1 && styles.btnDisabled]}
        onPress={() => page > 1 && onChange(page - 1)}
        disabled={page <= 1}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={page <= 1 ? "#C5C5C5" : "#16F2A8"}
        />
      </TouchableOpacity>

      <Text style={styles.text}>
        Trang <Text style={{ fontWeight: "bold" }}>{page}</Text>
      </Text>

      <TouchableOpacity
        style={[styles.btn, !hasNext && styles.btnDisabled]}
        onPress={() => hasNext && onChange(page + 1)}
        disabled={!hasNext}
        activeOpacity={0.7}
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={!hasNext ? "#C5C5C5" : "#16F2A8"}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginVertical: 16,
    backgroundColor: "#F8FDFB",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  btn: {
    padding: 4,
    borderRadius: 8,
    marginHorizontal: 6,
    backgroundColor: "#F3FBF7",
  },
  btnDisabled: {
    backgroundColor: "#F7F7F7",
  },
  text: {
    fontSize: 15.2,
    color: "#283A3C",
    marginHorizontal: 10,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
});

export default Pagination;
