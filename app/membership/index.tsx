import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "@/constants/Colors";
import { IMembershipPackage } from "@/types/api/membership";
import { MembershipService } from "@/services/membershipService";
import { PaymentService } from "@/services/paymentService"; // Add this import
import { useAuth } from "@/contexts/AuthContext"; // Add this import for user context

export default function MembershipScreen() {
  const router = useRouter();
  const { user } = useAuth(); // Get current user
  const [packages, setPackages] = useState<IMembershipPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembershipPackages = async () => {
      try {
        setLoading(true);
        const packages = await MembershipService.getMembershipPackages();
        setPackages(packages);
        setError(null);
      } catch (err) {
        setError("Không thể tải gói hội viên. Vui lòng thử lại sau.");
        console.error("Error fetching membership packages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembershipPackages();
  }, []);

  const handleSelectPackage = async (item: IMembershipPackage) => {
    try {
      if (!user?.id) {
        // Handle case where user is not logged in
        router.push("/login"); // Redirect to login
        return;
      }

      // Create payment with only the fields that are valid in the schema
      const payment = await PaymentService.createPayment({
        user_id: user.id,
        membership_package_id: item.id,
        // Remove payment_method as it's not defined in the API
      });

      // Check for success and paymentId from the response structure
      if (payment?.success && payment?.data?.id) {
        // Use the correct pathname that matches your file structure
        router.push({
          pathname: "/payment/[paymentId]",
          params: { paymentId: payment.data.id },
        });
      }
    } catch (err) {
      console.error("Payment creation error:", err);
      // Add proper error handling here
    }
  };

  const renderPackage = ({ item }: { item: IMembershipPackage }) => (
    <TouchableOpacity
      style={[
        styles.packageCard,
        item.is_popular && styles.popularPackageCard,
      ]}
      activeOpacity={0.8}
    >
      {item.is_popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>Phổ biến</Text>
        </View>
      )}
      <View style={styles.packageHeader}>
        <Text style={styles.packageName}>{item.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.packagePrice}>
            {item.price === 0
              ? "Miễn phí"
              : `${item.price.toLocaleString("vi-VN")}đ`}
          </Text>
          {item.duration_days > 0 && (
            <Text style={styles.duration}>/ {item.duration_days} ngày</Text>
          )}
        </View>
      </View>

      <Text style={styles.packageDescription}>{item.description}</Text>

      {item.features && item.features.length > 0 && (
        <View style={styles.featuresContainer}>
          {item.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={COLORS.light.PRIMARY_GREEN}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.selectButton,
          item.is_popular ? styles.popularSelectButton : {},
        ]}
        activeOpacity={0.7}
        onPress={() => handleSelectPackage(item)}
      >
        <Text style={styles.selectButtonText}>
          {item.price === 0 ? "Bắt đầu ngay" : "Chọn gói này"}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "Gói hội viên",
          headerBackTitle: "Quay lại",
          headerBackVisible: true,
          headerTitleStyle: styles.headerTitle,
          headerShadowVisible: false,
        }}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.crownImage}
            resizeMode="contain"
          />
          <Text style={styles.headerText}>Nâng cấp lên hội viên Premium</Text>
          <Text style={styles.subHeaderText}>
            Mở khóa tất cả tính năng và tối đa hóa hành trình cai thuốc của bạn
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.light.PRIMARY_BLUE} />
            <Text style={styles.loadingText}>Đang tải gói hội viên...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={50}
              color={COLORS.light.ERROR}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setLoading(true);
                setError(null);
                MembershipService.getMembershipPackages()
                  .then((packages) => {
                    setPackages(packages);
                  })
                  .catch((err) => {
                    setError("Không thể tải gói hội viên. Vui lòng thử lại sau.");
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={packages}
            renderItem={renderPackage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.packagesList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
  },
  headerContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    backgroundColor: COLORS.light.BG,
  },
  crownImage: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    marginBottom: 8,
    textAlign: "center",
  },
  subHeaderText: {
    fontSize: 15,
    color: COLORS.light.SUBTEXT,
    textAlign: "center",
    marginHorizontal: 20,
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  errorText: {
    marginTop: 15,
    marginBottom: 20,
    fontSize: 16,
    color: COLORS.light.ERROR,
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    borderRadius: 20,
  },
  retryButtonText: {
    color: COLORS.light.WHITE,
    fontWeight: "bold",
    fontSize: 15,
  },
  packagesList: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  packageCard: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    shadowColor: COLORS.light.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  popularPackageCard: {
    borderColor: COLORS.light.PRIMARY_BLUE,
    borderWidth: 2,
    backgroundColor: COLORS.light.PRIMARY_BLUE_LIGHT,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: COLORS.light.PRIMARY_BLUE,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: COLORS.light.WHITE,
    fontSize: 12,
    fontWeight: "bold",
  },
  packageHeader: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  packageName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
    flex: 1,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.light.TEXT,
  },
  duration: {
    fontSize: 14,
    color: COLORS.light.SUBTEXT,
    marginLeft: 2,
  },
  packageDescription: {
    fontSize: 15,
    color: COLORS.light.DARK_GREY_TEXT,
    marginBottom: 15,
    lineHeight: 20,
  },
  featuresContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.light.TEXT,
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: COLORS.light.CALL_TO_ACTION,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 5,
  },
  popularSelectButton: {
    backgroundColor: COLORS.light.PRIMARY_BLUE,
  },
  selectButtonText: {
    color: COLORS.light.WHITE,
    fontSize: 16,
    fontWeight: "bold",
  },
});