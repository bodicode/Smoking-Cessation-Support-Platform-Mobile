import React, { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import COLORS from '@/constants/Colors';
import { QuizService } from '@/services/quizService';
import { TemplateMatchingResult } from '@/types/api/quiz';

const MatchingResultDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [detail, setDetail] = useState<TemplateMatchingResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && typeof id === 'string') {
      fetchDetail(id);
    }
  }, [id]);

  const fetchDetail = async (id: string) => {
    try {
      setLoading(true);
      const data = await QuizService.getTemplateMatchingResultDetails(id);
      setDetail(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải chi tiết kế hoạch.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationLevelText = (level: string) => {
    switch (level) {
      case 'HIGH': return 'Cao';
      case 'MEDIUM': return 'Trung bình';
      case 'LOW': return 'Thấp';
      default: return level;
    }
  };

  if (loading || !detail) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.ACTIVE} />
        <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Chi tiết gợi ý AI',
          headerShown: true,
          headerBackTitle: 'Trở về',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTintColor: COLORS.light.TEXT,
          headerStyle: { backgroundColor: COLORS.light.BG },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.templateName}>{detail.template.name}</Text>
        <Text style={styles.templateDescription}>{detail.template.description}</Text>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Điểm phù hợp:</Text>
          <Text style={styles.scoreValue}>{detail.matchingScore}%</Text>
        </View>
        <View style={styles.recommendationLevelContainer}>
          <Text style={styles.recommendationLevelLabel}>Mức độ khuyến nghị:</Text>
          <Text style={styles.recommendationLevelValue}>{getRecommendationLevelText(detail.recommendationLevel)}</Text>
        </View>
        {detail.matchingFactors.reasoning.matchingFactors.length > 0 && (
          <View style={styles.matchingFactorsContainer}>
            <Text style={styles.matchingFactorsTitle}>Yếu tố phù hợp:</Text>
            {detail.matchingFactors.reasoning.matchingFactors.map((factor, idx) => (
              <Text key={idx} style={styles.matchingFactorItem}>• {factor}</Text>
            ))}
          </View>
        )}
        {detail.matchingFactors.reasoning.suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Gợi ý:</Text>
            {detail.matchingFactors.reasoning.suggestions.map((suggestion, idx) => (
              <Text key={idx} style={styles.suggestionItem}>• {suggestion}</Text>
            ))}
          </View>
        )}
        {detail.matchingFactors.reasoning.risks.length > 0 && (
          <View style={styles.risksContainer}>
            <Text style={styles.risksTitle}>Lưu ý:</Text>
            {detail.matchingFactors.reasoning.risks.map((risk, idx) => (
              <Text key={idx} style={styles.riskItem}>• {risk}</Text>
            ))}
          </View>
        )}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push(`/template/${detail.template.id}`)}
          >
            <Text style={styles.primaryButtonText}>Xem chi tiết mẫu kế hoạch này</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.secondaryButtonText}>Quay về trang chủ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.light.TEXT,
  },
  templateName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.light.ACTIVE,
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 15,
    color: COLORS.light.INACTIVE,
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 15,
    color: COLORS.light.TEXT,
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.ACTIVE,
  },
  recommendationLevelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationLevelLabel: {
    fontSize: 15,
    color: COLORS.light.TEXT,
    marginRight: 8,
  },
  recommendationLevelValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  matchingFactorsContainer: {
    marginTop: 12,
  },
  matchingFactorsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.light.TEXT,
    marginBottom: 6,
  },
  matchingFactorItem: {
    fontSize: 13,
    color: COLORS.light.TEXT,
    marginBottom: 2,
    lineHeight: 18,
  },
  suggestionsContainer: {
    marginTop: 12,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.light.TEXT,
    marginBottom: 6,
  },
  suggestionItem: {
    fontSize: 13,
    color: COLORS.light.TEXT,
    marginBottom: 2,
    lineHeight: 18,
  },
  risksContainer: {
    marginTop: 12,
  },
  risksTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#D32F2F',
    marginBottom: 6,
  },
  riskItem: {
    fontSize: 13,
    color: '#D32F2F',
    marginBottom: 2,
    lineHeight: 18,
  },
  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.light.ACTIVE,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.light.ACTIVE,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.light.ACTIVE,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MatchingResultDetailPage; 