import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { PlanTemplate } from "@/types/api/template";
import { PlanTemplateService } from "@/services/templatePlanService";
import { getLevelColor, translateLevel } from "@/utils";
import { useNavigation } from "expo-router";

const { width } = Dimensions.get("window");

export default function PlanTemplateDetailScreen() {
  const route = useRoute<RouteProp<{ params: { id: string } }, "params">>();
  const { id } = route.params;
  const navigation = useNavigation();

  const [template, setTemplate] = useState<PlanTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PlanTemplateService.getTemplateById(id)
      .then((data) => {
        setTemplate(data);
        // Set header title khi có data
        if (data?.name) navigation.setOptions({ title: data.name });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#16F2A8" />
      </View>
    );
  }

  if (!template) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "#9ca3af", fontSize: 16 }}>
          Không tìm thấy kế hoạch.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 0, paddingBottom: 36 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.levelLabel}>
          <Ionicons
            name="flash"
            size={17}
            color={getLevelColor(template.difficulty_level)}
          />
          <Text
            style={{
              color: getLevelColor(template.difficulty_level),
              fontWeight: "700",
              marginLeft: 6,
            }}
          >
            {`  ${translateLevel(template.difficulty_level)}`}
          </Text>
        </Text>
        <Text style={styles.title}>{template.name}</Text>
        <Text style={styles.desc}>{template.description}</Text>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="person-circle" size={22} color="#73B3FA" />
          <Text style={styles.infoMain}>Coach:</Text>
          <Text style={styles.infoSub}>{template.coach?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="star" size={20} color="#FFB936" />
          <Text style={styles.infoMain}>
            {template.average_rating.toFixed(1)}/5
          </Text>
          <Text style={styles.infoSub}>
            ({template.total_reviews} đánh giá)
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="checkmark-circle" size={20} color="#34D399" />
          <Text style={styles.infoMain}>Tỷ lệ thành công:</Text>
          <Text
            style={[styles.infoSub, { color: "#0C9775", fontWeight: "700" }]}
          >
            {(template.success_rate * 100).toFixed(1)}%
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={20} color="#16F2A8" />
          <Text style={styles.infoMain}>Thời gian:</Text>
          <Text style={styles.infoSub}>
            {template.estimated_duration_days} ngày
          </Text>
        </View>
      </View>

      {/* Timeline Stages */}
      <Text style={styles.sectionLabel}>Các giai đoạn</Text>
      <View style={styles.timeline}>
        {template.stages.map((stage, idx) => (
          <View key={stage.id} style={styles.timelineRow}>
            {/* Timeline Dot & Line */}
            <View style={styles.timelineLeft}>
              <View style={styles.timelineDot} />
              {idx < template.stages.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>
            {/* Content */}
            <View style={styles.timelineContent}>
              <Text style={styles.stageTitle}>
                {stage.stage_order}. {stage.title}
              </Text>
              <Text style={styles.stageDesc}>{stage.description}</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <Ionicons
                  name="reader-outline"
                  size={14}
                  color="#276ef1"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.stageAction} numberOfLines={2}>
                  {stage.recommended_actions}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <Ionicons
                  name="hourglass-outline"
                  size={14}
                  color="#16a37a"
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.stageDuration}>
                  {stage.duration_days} ngày
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FAFAFC",
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFC",
  },
  hero: {
    paddingHorizontal: 28,
    paddingTop: 38,
    paddingBottom: 18,
    backgroundColor: "#E5F9F4",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    alignItems: "flex-start",
    elevation: 4,
    shadowColor: "#16F2A8",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },
  levelLabel: {
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 9,
    letterSpacing: 0.3,
    backgroundColor: "#F4F7F8",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
    color: "#0E9F6E",
  },
  title: {
    fontSize: 22.5,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 8,
    marginTop: 3,
    letterSpacing: 0.05,
    textShadowColor: "#e0f8e7",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  desc: {
    color: "#555",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
    marginBottom: 2,
  },
  infoCard: {
    marginTop: -22,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 16,
    zIndex: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  infoMain: {
    fontWeight: "600",
    fontSize: 15.5,
    marginLeft: 10,
    color: "#253053",
    minWidth: 70,
  },
  infoSub: {
    fontWeight: "500",
    color: "#495467",
    marginLeft: 8,
    fontSize: 14.5,
  },
  sectionLabel: {
    marginHorizontal: 28,
    marginBottom: 6,
    marginTop: 2,
    color: "#0CA678",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: 0.3,
  },
  timeline: {
    marginHorizontal: 10,
    marginTop: 6,
    paddingBottom: 24,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  timelineLeft: {
    alignItems: "center",
    width: 24,
  },
  timelineDot: {
    width: 12,
    height: 12,
    backgroundColor: "#16F2A8",
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#E1F9F2",
    marginTop: 8,
  },
  timelineLine: {
    width: 3,
    height: 70,
    backgroundColor: "#E7F9F4",
    marginTop: 0,
    borderRadius: 3,
  },
  timelineContent: {
    backgroundColor: "#fff",
    borderRadius: 13,
    padding: 13,
    marginLeft: 2,
    minWidth: width * 0.7,
    elevation: 2,
    shadowColor: "#16F2A8",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 1, height: 4 },
  },
  stageTitle: {
    fontWeight: "bold",
    fontSize: 15.3,
    color: "#297966",
    marginBottom: 3,
  },
  stageDesc: {
    color: "#657080",
    fontSize: 13.2,
    marginBottom: 2,
    fontWeight: "400",
  },
  stageAction: {
    color: "#276ef1",
    fontSize: 13.2,
    marginBottom: 0,
    flex: 1,
  },
  stageDuration: {
    fontSize: 13.1,
    color: "#16a37a",
    fontWeight: "600",
  },
});
