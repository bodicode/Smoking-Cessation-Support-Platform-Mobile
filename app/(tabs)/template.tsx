import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Platform,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { PlanTemplate } from "@/types/api/template";
import { PlanTemplateService } from "@/services/templatePlanService";
import { getLevelColor, translateLevel } from "@/utils";
import { useRouter } from "expo-router";
import HomeHeader from "@/components/home/header";
import { useAuth } from "@/contexts/AuthContext";

export default function TemplateScreen() {
  const [templates, setTemplates] = useState<PlanTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await PlanTemplateService.getTemplates();
      setTemplates(res);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color="#16F2A8" size="large" />
        </View>
      </SafeAreaView>
    );

  if (!templates.length)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Ionicons name="list-outline" size={48} color="#b6bdca" />
          <Text style={styles.empty}>Không có kế hoạch nào</Text>
        </View>
      </SafeAreaView>
    );

  return (
    <View style={styles.safeArea}>
      <HomeHeader user={user} />

      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <PlanTemplateCard
            template={item}
            onPress={() =>
              // Expo Router điều hướng tới template/[id]
              router.push({
                pathname: "/template/[id]",
                params: { id: item.id },
              })
            }
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

type PlanTemplateCardProps = {
  template: PlanTemplate;
  onPress: () => void;
};

function PlanTemplateCard({ template, onPress }: PlanTemplateCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.91}
      onPress={onPress}
      style={{ marginBottom: 0 }}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{template.name}</Text>
          <Text
            style={[
              styles.level,
              { color: getLevelColor(template.difficulty_level) },
            ]}
          >
            {translateLevel(template.difficulty_level)}
          </Text>
        </View>
        <Text style={styles.desc} numberOfLines={2}>
          {template.description}
        </Text>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={17} color="#16F2A8" />
          <Text style={styles.info}>
            {template.estimated_duration_days} ngày
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginLeft: 10,
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => {
              if (i < Math.floor(template.average_rating)) {
                return (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color="#ffbb36"
                    style={{ marginRight: 1 }}
                  />
                );
              } else if (
                i === Math.floor(template.average_rating) &&
                template.average_rating % 1 >= 0.5
              ) {
                return (
                  <Ionicons
                    key={i}
                    name="star-half"
                    size={16}
                    color="#ffbb36"
                    style={{ marginRight: 1 }}
                  />
                );
              } else {
                return (
                  <Ionicons
                    key={i}
                    name="star"
                    size={16}
                    color="#dadada"
                    style={{ marginRight: 1 }}
                  />
                );
              }
            })}
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={15} color="#b5bbc7" />
          <Text style={styles.info}>{template.coach.name}</Text>
          <Ionicons
            name="checkmark-circle-outline"
            size={15}
            color="#33c275"
            style={{ marginLeft: 10 }}
          />
          <Text style={styles.info}>
            Tỷ lệ thành công: {(template.success_rate * 100).toFixed(1)}%
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10, marginLeft: -6 }}
        >
          {template.stages.map((stage) => (
            <View key={stage.id} style={styles.stage}>
              <Text style={styles.stageTitle}>
                {stage.stage_order}. {stage.title}
              </Text>
              <Text style={styles.stageDesc} numberOfLines={1}>
                {stage.description}
              </Text>
              <Text style={styles.stageAction} numberOfLines={1}>
                📝 {stage.recommended_actions}
              </Text>
              <Text style={styles.stageDuration}>
                ⏳ {stage.duration_days} ngày
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#F0F4FA",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    marginTop: 16,
    color: "#b6bdca",
    fontSize: 16,
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    // shadow for iOS
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    // shadow for Android
    elevation: 5,
    // border for visual highlight
    borderWidth: 1,
    borderColor: "#e7ecef",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 3,
  },
  name: {
    fontWeight: "700",
    fontSize: 19,
    color: "#233264",
    letterSpacing: 0.2,
    flex: 1,
  },
  level: {
    fontSize: 13,
    backgroundColor: "#E3F6F1",
    color: "#16F2A8",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    fontWeight: "600",
    overflow: "hidden",
    marginLeft: 10,
  },
  desc: {
    color: "#555",
    marginTop: 4,
    marginBottom: 10,
    fontSize: 15,
    lineHeight: 21,
    letterSpacing: 0.05,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
    gap: 5,
  },
  info: {
    fontSize: 13.5,
    color: "#495467",
    marginLeft: 4,
    fontWeight: "500",
  },
  stage: {
    minWidth: 170,
    maxWidth: 210,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f4fbf7",
    marginRight: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e1e7ef",
    shadowColor: "#16F2A8",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 1, height: 3 },
    elevation: 1,
  },
  stageTitle: {
    fontWeight: "700",
    fontSize: 14.5,
    color: "#16a37a",
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  stageDesc: {
    color: "#617080",
    fontSize: 13,
    marginTop: 1,
    marginBottom: 1,
    fontWeight: "400",
  },
  stageAction: {
    color: "#3172ea",
    fontSize: 13,
    marginTop: 1,
    marginBottom: 1,
  },
  stageDuration: {
    fontSize: 13,
    color: "#16a37a",
    marginTop: 2,
    fontWeight: "600",
  },
});
