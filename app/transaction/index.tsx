import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import COLORS from "@/constants/Colors";
import { PaymentService } from "@/services/paymentService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function TransactionScreen() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      const res = await PaymentService.getMemberPaymentsWithTransactions();
      if (res.success) {
        setTransactions(res.data);
      }
      setLoading(false);
    };
    fetchTransactions();
  }, []);

  const getStatusStyle = (status: string) => {
    if (status === "success" || status === "completed") {
      return {
        borderColor: COLORS.light.PRIMARY_GREEN,
        gradient: [COLORS.light.PRIMARY_GREEN + "18", COLORS.light.WHITE],
      };
    }
    if (status === "pending") {
      return {
        borderColor: COLORS.light.WARNING,
        gradient: [COLORS.light.WARNING + "18", COLORS.light.WHITE],
      };
    }
    if (status === "failed" || status === "cancelled") {
      return {
        borderColor: COLORS.light.ERROR,
        gradient: [COLORS.light.ERROR + "18", COLORS.light.WHITE],
      };
    }
    return {
      borderColor: COLORS.light.SUBTEXT,
      gradient: [COLORS.light.LIGHT_GREY_BG, COLORS.light.WHITE],
    };
  };

  const renderStatus = (status: string) => {
    let color = COLORS.light.SUBTEXT;
    let icon = "time-outline";
    let label = status;
    if (status === "SUCCESS") {
      color = COLORS.light.PRIMARY_GREEN;
      icon = "checkmark-circle";
      label = "Thành công";
    } else if (status === "PENDING") {
      color = COLORS.light.WARNING;
      icon = "time-outline";
      label = "Đang xử lý";
    } else if (status === "failed" || status === "cancelled") {
      color = COLORS.light.ERROR;
      icon = "close-circle";
      label = "Thất bại";
    }
    return (
      <View style={styles.statusRow}>
        <Ionicons
          name={icon as any}
          size={18}
          color={color}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.statusText, { color }]}>{label}</Text>
      </View>
    );
  };

  const renderCard = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyle(item.status);
    return (
      <LinearGradient
        colors={statusStyle.gradient}
        style={[
          styles.card,
          { borderLeftColor: statusStyle.borderColor },
        ]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
      >
        <View style={styles.cardRow}>
          <Ionicons
            name="pricetag"
            size={18}
            color={COLORS.light.PRIMARY_GREEN}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.label}>Mã giao dịch:</Text>
          <Text style={styles.value}>{item.id}</Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons
            name="receipt-outline"
            size={18}
            color={COLORS.light.PRIMARY_BLUE}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.label}>Mã thanh toán:</Text>
          <Text style={styles.value}>{item.payment_transaction_id || "—"}</Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons
            name="cash-outline"
            size={18}
            color={COLORS.light.PRIMARY_RED}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.label}>Số tiền:</Text>
          <Text
            style={[
              styles.value,
              { color: COLORS.light.PRIMARY_RED, fontWeight: "bold" },
            ]}
          >
            {item.price?.toLocaleString("vi-VN")}đ
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons
            name="alert-circle-outline"
            size={18}
            color={statusStyle.borderColor}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.label}>Trạng thái:</Text>
          {renderStatus(item.status)}
        </View>
        <View style={styles.cardRow}>
          <Ionicons
            name="gift-outline"
            size={18}
            color={COLORS.light.PRIMARY_BLUE}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.label}>Gói:</Text>
          <Text
            style={[
              styles.value,
              { color: COLORS.light.PRIMARY_BLUE, fontWeight: "bold" },
            ]}
          >
            {item.subscription?.package?.name || "—"}
          </Text>
        </View>
        <View style={styles.cardRow}>
          <Ionicons
            name="calendar-outline"
            size={18}
            color={COLORS.light.PRIMARY_GREEN}
            style={{ marginRight: 6 }}
          />
          <Text style={styles.label}>Thời hạn:</Text>
          <Text style={styles.value}>
            {item.subscription?.package?.duration_days
              ? `${item.subscription.package.duration_days} ngày`
              : "—"}
          </Text>
        </View>
      </LinearGradient>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.light.PRIMARY_GREEN} />
        </TouchableOpacity>
        <Text style={styles.title}>Giao dịch</Text>
        <View style={{ width: 40 }} /> {/* Placeholder for alignment */}
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.light.PRIMARY_GREEN} />
          <Text style={styles.loadingText}>Đang tải giao dịch...</Text>
        </View>
      ) : transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="file-tray-outline"
            size={48}
            color={COLORS.light.SUBTEXT}
          />
          <Text style={styles.emptyText}>Không có giao dịch nào</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    width: 40,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.light.PRIMARY_GREEN,
    textAlign: "center",
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderLeftWidth: 6,
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    color: COLORS.light.SUBTEXT,
    fontWeight: "500",
    width: 110,
  },
  value: {
    fontSize: 15,
    color: COLORS.light.TEXT,
    fontWeight: "600",
    flex: 1,
    flexWrap: "wrap",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
  },
});