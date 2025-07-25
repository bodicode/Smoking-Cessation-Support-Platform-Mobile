import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";
import COLORS from "@/constants/Colors";
import { IProgressRecord } from "@/types/api/processRecord";
import { PlanStageChartService } from "@/services/myPlanService";
import { Ionicons } from '@expo/vector-icons';
import { UserService } from '@/services/userService';

interface ProgressChartsProps {
  records: IProgressRecord[];
  planId?: string;
}

const screenWidth = Dimensions.get("window").width;
const chartHorizontalPadding = 16;
const chartAvailableWidth = Math.max(screenWidth - 2 * chartHorizontalPadding, 200);
const chartWidthWithPadding = chartAvailableWidth + 2 * chartHorizontalPadding;

const ProgressCharts: React.FC<ProgressChartsProps> = ({ records, planId }) => {
  const [stageChartData, setStageChartData] = useState<any>(null);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    if (planId) {
      PlanStageChartService.getPlanStageCharts(planId)
        .then(data => {
          setStageChartData(data);
          setSelectedStageIndex(0);
        })
        .catch(() => setStageChartData(null));
    }
  }, [planId]);

  useEffect(() => {
    setLeaderboardLoading(true);
    UserService.getStreakLeaderboard(10, 0)
      .then(setLeaderboard)
      .catch(() => setLeaderboard(null))
      .finally(() => setLeaderboardLoading(false));
  }, []);

  const sortedRecords = [...records].sort(
    (a, b) =>
      new Date(a.record_date).getTime() - new Date(b.record_date).getTime()
  );

  const chartLabels = sortedRecords.map((record) => {
    const date = new Date(record.record_date);

    return `${date.getDate()}/${date.getMonth() + 1}`;
  });

  const healthData = sortedRecords.map((record) => record.health_score);
  const cigarettesData = sortedRecords.map(
    (record) => record.cigarettes_smoked
  );

  const maxHealthScore = Math.max(10, ...healthData, 1);
  const maxCigarettes = Math.max(5, ...cigarettesData, 1);

  const getAugmentedDataAndLabels = (data: number[], labels: string[]) => {
    if (data.length < 2) {
      return { augmentedData: data, augmentedLabels: labels };
    }
    const augmentedData = [];
    const augmentedLabels = [];
    for (let i = 0; i < data.length; i++) {
      augmentedData.push(data[i]);
      augmentedLabels.push(labels[i]);
      if (i < data.length - 1) {
        augmentedData.push((data[i] + data[i + 1]) / 2);
        augmentedLabels.push("");
      }
    }
    return { augmentedData, augmentedLabels };
  };

  const healthChartData = {
    labels: chartLabels,
    datasets: [
      {
        data: healthData,
        color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const cigarettesChartData = {
    labels: chartLabels,
    datasets: [
      {
        data: cigarettesData,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const commonChartConfig = {
    backgroundGradientFrom: COLORS.light.CARD_BG,
    backgroundGradientTo: COLORS.light.CARD_BG,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(150, 150, 150, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: COLORS.light.WHITE,
    },
    propsForLabels: {
      fontSize: 10,
      fontWeight: "bold",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: COLORS.light.BORDER_LIGHT_GREY,
      strokeWidth: 0.5,
    },
    yAxisInterval: 1,
    yAxisLabel: "",
    fromZero: true,
    useShadowColorFromDataset: false,
  };

  const renderStageSelector = (stages: any[]) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
      {stages.map((stage, idx) => (
        <TouchableOpacity
          key={stage.stage_id}
          style={[
            styles.stageTab,
            idx === selectedStageIndex && styles.stageTabActive
          ]}
          onPress={() => setSelectedStageIndex(idx)}
        >
          <Text style={[
            styles.stageTabText,
            idx === selectedStageIndex && styles.stageTabTextActive
          ]}>{stage.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {records.length > 0 ? (
        <>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Điểm sức khỏe</Text>
            <LineChart
              data={healthChartData}
              width={chartWidthWithPadding}
              height={250}
              style={{ marginLeft: -chartHorizontalPadding }}
              chartConfig={{
                ...commonChartConfig,
                color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
                fillShadowGradient: COLORS.light.PRIMARY_GREEN,
                fillShadowGradientOpacity: 0.25,
                propsForDots: {
                  ...commonChartConfig.propsForDots,
                  fill: COLORS.light.PRIMARY_GREEN,
                },
              }}
              bezier
              withHorizontalLabels
              withVerticalLabels
              withDots
              yLabelsOffset={8}
              verticalLabelRotation={-40}
              segments={Math.max(2, maxHealthScore > 5 ? 5 : maxHealthScore)}
              yAxisSuffix=""
            />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Số thuốc đã hút</Text>
            <LineChart
              data={cigarettesChartData}
              width={chartWidthWithPadding}
              height={220}
              style={{ marginLeft: -chartHorizontalPadding }}
              chartConfig={{
                ...commonChartConfig,
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                fillShadowGradient: COLORS.light.PRIMARY_RED,
                fillShadowGradientOpacity: 0.25,
                propsForDots: {
                  ...commonChartConfig.propsForDots,
                  fill: COLORS.light.PRIMARY_RED,
                },
              }}
              bezier
              withHorizontalLabels
              withVerticalLabels
              withDots
              yLabelsOffset={8}
              verticalLabelRotation={-40}
              segments={Math.max(2, maxCigarettes > 5 ? 5 : maxCigarettes)}
              yAxisSuffix=""
            />
          </View>

          {stageChartData && stageChartData.stages && stageChartData.stages.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Biểu đồ theo giai đoạn kế hoạch</Text>
              {renderStageSelector(stageChartData.stages)}
              {(() => {
                const stage = stageChartData.stages[selectedStageIndex];
                if (!stage) return null;
                const labels = stage.chart_data.map((d: any) => {
                  const date = new Date(d.date);
                  return `${date.getDate()}/${date.getMonth() + 1}`;
                });
                const smokedData = stage.chart_data.map((d: any) => d.cigarettes_smoked);
                const limitData = stage.chart_data.map((d: any) => d.max_cigarettes_per_day ?? stage.max_cigarettes_per_day);
                const daysExceeded = stage.chart_data.filter((d: any) => d.exceeded_limit).length;
                return (
                  <>
                    <View style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Ionicons name="flag-outline" size={18} color={COLORS.light.PRIMARY_BLUE} style={{ marginRight: 4 }} />
                      <Text style={{ fontWeight: 'bold', color: COLORS.light.PRIMARY_BLUE }}>{stage.title}</Text>
                      <Text style={{ marginLeft: 8, color: COLORS.light.SUBTEXT, fontSize: 13 }}>
                        {stage.start_date && stage.end_date ? `(${stage.start_date} - ${stage.end_date})` : ''}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Ionicons name="remove-circle-outline" size={16} color={COLORS.light.PRIMARY_RED} style={{ marginRight: 2 }} />
                      <Text style={{ fontSize: 13, color: COLORS.light.PRIMARY_RED, marginRight: 10 }}>
                        Giới hạn/ngày: {stage.max_cigarettes_per_day}
                      </Text>
                      <Ionicons name="warning-outline" size={16} color={'#FFA500'} style={{ marginRight: 2 }} />
                      <Text style={{ fontSize: 13, color: '#FFA500' }}>
                        Số ngày vượt giới hạn: {daysExceeded}
                      </Text>
                    </View>
                    <LineChart
                      data={{
                        labels,
                        datasets: [
                          {
                            data: smokedData,
                            color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
                            strokeWidth: 3,
                          },
                          {
                            data: limitData,
                            color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                            strokeWidth: 2,
                            withDots: false,
                          },
                        ],
                        legend: ['Số điếu đã hút', 'Giới hạn tối đa'],
                      }}
                      width={chartWidthWithPadding}
                      height={200}
                      style={{ marginLeft: -chartHorizontalPadding }}
                      chartConfig={{
                        ...commonChartConfig,
                        color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
                        fillShadowGradient: COLORS.light.PRIMARY_GREEN,
                        fillShadowGradientOpacity: 0.15,
                        propsForDots: {
                          ...commonChartConfig.propsForDots,
                          fill: COLORS.light.PRIMARY_GREEN,
                        },
                      }}
                      bezier
                      withHorizontalLabels
                      withVerticalLabels
                      withDots
                      yLabelsOffset={8}
                      verticalLabelRotation={-40}
                      segments={4}
                      yAxisSuffix=""
                    />
                  </>
                );
              })()}
            </View>
          )}

        </>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            Bạn chưa ghi lại tiến độ nào.{"\n"}Hãy bắt đầu hành trình của mình!
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 20,
    gap: 20,
  },
  chartCard: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 0,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: 19,
    fontWeight: "600",
    color: COLORS.light.TEXT,
    marginBottom: 15,
    textAlign: "center",
  },
  noDataContainer: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  noDataText: {
    fontSize: 16,
    color: COLORS.light.SUBTEXT,
    textAlign: "center",
    lineHeight: 24,
  },
  stageTab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_GREY,
  },
  stageTabActive: {
    backgroundColor: COLORS.light.PRIMARY_BLUE_LIGHT,
    borderColor: COLORS.light.PRIMARY_BLUE,
  },
  stageTabText: {
    color: COLORS.light.TEXT,
    fontWeight: '500',
    fontSize: 14,
  },
  stageTabTextActive: {
    color: COLORS.light.PRIMARY_BLUE_DARK,
    fontWeight: 'bold',
  },
});

export default ProgressCharts;
