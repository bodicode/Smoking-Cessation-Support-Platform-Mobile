import React from "react";
import { View, Text, Dimensions, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import COLORS from "@/constants/Colors";
import { IProgressRecord } from "@/types/api/processRecord";

interface ProgressChartsProps {
  records: IProgressRecord[];
}

const screenWidth = Dimensions.get("window").width;

const ProgressCharts: React.FC<ProgressChartsProps> = ({ records }) => {
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

  const chartAvailableWidth = 400;

  return (
    <View style={styles.container}>
      {records.length > 0 ? (
        <>
          {/* Health Score Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Điểm sức khỏe</Text>
            <LineChart
              data={healthChartData}
              width={chartAvailableWidth}
              height={250}
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

          {/* Cigarettes Smoked Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Số thuốc đã hút</Text>
            <LineChart
              data={cigarettesChartData}
              width={chartAvailableWidth}
              height={220}
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
});

export default ProgressCharts;
