import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  Image, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView 
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { PaymentService } from "@/services/paymentService";
import COLORS from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

type PaymentQRCodeProps = {
  amount: number;
  description: string;
  acc?: string;
  bank?: string;
  className?: string;
};

const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  amount,
  description,
  acc = "27202407",
  bank = "ACB",
  className,
}) => {
  const qrUrl = `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${description}`;
  return (
    <View style={styles.qrContainer}>
      <Text style={styles.qrLabel}>Quét mã QR để thanh toán</Text>
      <View style={styles.qrBox}>
        <Image
          source={{ uri: qrUrl }}
          style={{ width: 256, height: 256, borderRadius: 16 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default function PaymentPage() {
  const router = useRouter();
  const { paymentId } = useLocalSearchParams();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [expandContent, setExpandContent] = useState(false);

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId) return;
    
    try {
      setIsCheckingStatus(true);
      const response = await PaymentService.getPaymentById(paymentId as string);
      if (response.success && response.data) {
        setPayment(response.data);
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [paymentId]);

  // Initial data fetch
  useEffect(() => {
    if (paymentId) {
      PaymentService.getPaymentById(paymentId as string)
        .then((response) => {
          if (response.success && response.data) {
            setPayment(response.data);
          } else {
            setError(response.error || "Không thể lấy thông tin thanh toán");
          }
        })
        .catch((err) => {
          console.error("Payment page error:", err);
          setError("Đã xảy ra lỗi khi tải thông tin thanh toán");
        })
        .finally(() => setLoading(false));
    }
  }, [paymentId]);

  // Set up automatic status check every 10 seconds
  useEffect(() => {
    if (!payment || payment.status === "SUCCESS") return;

    const intervalId = setInterval(() => {
      checkPaymentStatus();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(intervalId);
  }, [payment, checkPaymentStatus]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.light.PRIMARY_GREEN} />
      </View>
    );
  }

  // Error state
  if (error || !payment) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={50} color={COLORS.light.ERROR} />
        <Text style={styles.errorText}>{error || "Không tìm thấy thông tin thanh toán!"}</Text>
      </View>
    );
  }

  // Payment success state
  if (payment.status === "SUCCESS") {
    return (
      <>
        <Stack.Screen 
          options={{
            title: "Thanh toán thành công",
            headerBackVisible: false,
          }}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={80} color={COLORS.light.PRIMARY_GREEN} />
            </View>
            <Text style={styles.successTitle}>Thanh toán thành công!</Text>
            <Text style={styles.successDesc}>
              Gói hội viên của bạn đã được kích hoạt.
            </Text>
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.replace("/")}
            >
              <Text style={styles.homeButtonText}>Về trang chủ</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }

  // Regular payment pending state
  const transactionContent = `PAYMENT${payment.id}`;
  const isContentLong = transactionContent.length > 25;

  return (
    <>
      <Stack.Screen 
        options={{
          title: "Thanh toán",
          headerBackTitle: "Quay lại",
          headerBackVisible: true,
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView>
          <View style={styles.container}>
            <View style={styles.headerSection}>
              <Text style={styles.title}>Thanh toán hội viên</Text>
              <Text style={styles.subtitle}>Quét mã QR để thanh toán</Text>
            </View>
            
            <View style={styles.qrSection}>
              <PaymentQRCode
                amount={payment.price}
                description={transactionContent}
              />
            </View>
            
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số tiền:</Text>
                <Text style={styles.infoValue}>{payment.price.toLocaleString("vi-VN")}đ</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nội dung chuyển khoản:</Text>
                <View style={styles.contentContainer}>
                  {isContentLong && !expandContent ? (
                    <TouchableOpacity onPress={() => setExpandContent(true)}>
                      <Text style={styles.infoValue}>
                        {transactionContent.substring(0, 20)}...
                        <Text style={styles.expandText}> Xem thêm</Text>
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.infoValue}>
                      {transactionContent}
                      {isContentLong && (
                        <TouchableOpacity onPress={() => setExpandContent(false)}>
                          <Text style={styles.expandText}> Thu gọn</Text>
                        </TouchableOpacity>
                      )}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Trạng thái:</Text>
                <Text style={[
                  styles.statusText, 
                  payment.status === "PENDING" ? styles.pendingStatus : styles.successStatus
                ]}>
                  {payment.status === "PENDING" ? "Đang xử lý" : "Thành công"}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.checkStatusButton}
              onPress={checkPaymentStatus}
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.checkStatusText}>Kiểm tra trạng thái</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.noteSection}>
              <Text style={styles.noteText}>
                Sau khi thanh toán thành công, hệ thống sẽ tự động kích hoạt gói hội viên cho bạn.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
  },
  container: { 
    flex: 1, 
    alignItems: "center", 
    padding: 20,
    backgroundColor: COLORS.light.BG,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 8, 
    color: COLORS.light.PRIMARY_GREEN, 
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
    textAlign: 'center',
  },
  qrSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  infoSection: {
    width: '100%',
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.light.SUBTEXT,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.light.TEXT,
  },
  noteSection: {
    width: '100%',
    padding: 16,
  },
  noteText: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
    textAlign: 'center',
    lineHeight: 20,
  },
  centered: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    backgroundColor: COLORS.light.BG,
  },
  errorText: { 
    color: COLORS.light.ERROR, 
    fontSize: 16, 
    textAlign: "center", 
    paddingHorizontal: 20,
    marginTop: 12,
  },
  qrContainer: { 
    alignItems: "center", 
    marginBottom: 18,
  },
  qrLabel: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 10,
    color: COLORS.light.SUBTEXT, 
  },
  qrBox: { 
    backgroundColor: "#f0fdf4", 
    padding: 12, 
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  successIconContainer: {
    backgroundColor: '#dcfce7',
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
    textAlign: "center",
    marginBottom: 30,
  },
  homeButton: {
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  homeButtonText: {
    color: COLORS.light.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  checkStatusButton: {
    backgroundColor: COLORS.light.PRIMARY_GREEN,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 16,
    width: '80%',
  },
  checkStatusText: {
    color: COLORS.light.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  expandText: {
    color: COLORS.light.PRIMARY_BLUE,
    fontWeight: "500",
  },
  statusText: {
    fontWeight: "600",
    fontSize: 15,
  },
  pendingStatus: {
    color: "#f59e0b",
  },
  successStatus: {
    color: COLORS.light.PRIMARY_GREEN,
  },
});
