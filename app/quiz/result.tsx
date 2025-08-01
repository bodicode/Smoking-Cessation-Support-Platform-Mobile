import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '@/constants/Colors';
import { QuizService } from '@/services/quizService';
import { QuizAttempt, TemplateMatchingResult } from '@/types/api/quiz';

const QuizResultPage: React.FC = () => {
  const router = useRouter();
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [templateMatchingResults, setTemplateMatchingResults] = useState<TemplateMatchingResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    loadQuizResult();
  }, []);

  const loadQuizResult = async () => {
    try {
      setLoading(true);

      const attempt = await QuizService.getQuizAttempt();
      if (!attempt) {
        Alert.alert('Thông báo', 'Không tìm thấy kết quả khảo sát.');
        router.back();
        return;
      }

      setQuizAttempt(attempt);
      setLoading(false);

      loadTemplateMatchingResults();
    } catch (error) {
      console.error('Error loading quiz result:', error);
      Alert.alert('Lỗi', 'Không thể tải kết quả khảo sát. Vui lòng thử lại.');
      router.back();
    }
  };

  const loadTemplateMatchingResults = async () => {
    try {
      setMatchingLoading(true);
      const results = await QuizService.getMyTemplateMatchingResults();
      const sortedResults = [...results].sort((a, b) => b.matchingScore - a.matchingScore);
      setTemplateMatchingResults(sortedResults);
    } catch (error) {
      console.error('Error loading template matching results:', error);
      setTemplateMatchingResults([]);
    } finally {
      setMatchingLoading(false);
    }
  };

  const getRecommendationLevelText = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'Cao';
      case 'MEDIUM':
        return 'Trung bình';
      case 'LOW':
        return 'Thấp';
      default:
        return level;
    }
  };

  const handleViewAlternatives = () => {
    router.push('/(tabs)/template');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.light.ACTIVE} />
          <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quizAttempt) {
    return null;
  }

  const completedDate = quizAttempt.completed_at
    ? new Date(quizAttempt.completed_at).toLocaleDateString('vi-VN')
    : new Date(quizAttempt.updated_at).toLocaleDateString('vi-VN');

  return (
    <>
      <Stack.Screen
        options={{
          title: "Kết quả khảo sát",
          headerShown: true,
          headerStyle: {
            backgroundColor: COLORS.light.BG,
          },
          headerTintColor: COLORS.light.TEXT,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statusContainer}>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons name="check-circle" size={48} color="#4CAF50" />
            </View>
            <Text style={styles.statusTitle}>Hoàn thành khảo sát!</Text>
            <Text style={styles.statusSubtitle}>
              Bạn đã hoàn thành khảo sát vào {completedDate}
            </Text>
          </View>

          <View style={styles.recommendationContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gợi ý mẫu đến từ AI</Text>
              {matchingLoading && (
                <View style={styles.aiLoadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.light.ACTIVE} />
                  <Text style={styles.aiLoadingText}>Đang phân tích...</Text>
                </View>
              )}
            </View>

            {templateMatchingResults.length > 0 ? (
              <>
                {templateMatchingResults.map((result, index) => (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.templateResultContainer}
                    onPress={() => router.push(`/quiz/matching-result/${result.id}`)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.templateName}>{result.template.name}</Text>
                    <Text style={styles.templateDescription}>{result.template.description}</Text>
                    <View style={styles.scoreContainer}>
                      <Text style={styles.scoreLabel}>Điểm phù hợp:</Text>
                      <Text style={styles.scoreValue}>{result.matchingScore}%</Text>
                    </View>
                    <View style={styles.recommendationLevelContainer}>
                      <Text style={styles.recommendationLevelLabel}>Mức độ khuyến nghị:</Text>
                      <Text style={styles.recommendationLevelValue}>{getRecommendationLevelText(result.recommendationLevel)}</Text>
                    </View>
                    {result.matchingFactors.reasoning.matchingFactors.length > 0 && (
                      <View style={styles.matchingFactorsContainer}>
                        <Text style={styles.matchingFactorsTitle}>Yếu tố phù hợp:</Text>
                        {result.matchingFactors.reasoning.matchingFactors.map((factor, factorIndex) => (
                          <Text key={factorIndex} style={styles.matchingFactorItem}>
                            • {factor}
                          </Text>
                        ))}
                      </View>
                    )}
                    {result.matchingFactors.reasoning.suggestions.length > 0 && (
                      <View style={styles.suggestionsContainer}>
                        <Text style={styles.suggestionsTitle}>Gợi ý:</Text>
                        {result.matchingFactors.reasoning.suggestions.map((suggestion, suggestionIndex) => (
                          <Text key={suggestionIndex} style={styles.suggestionItem}>
                            • {suggestion}
                          </Text>
                        ))}
                      </View>
                    )}
                    {result.matchingFactors.reasoning.risks.length > 0 && (
                      <View style={styles.risksContainer}>
                        <Text style={styles.risksTitle}>Lưu ý:</Text>
                        {result.matchingFactors.reasoning.risks.map((risk, riskIndex) => (
                          <Text key={riskIndex} style={styles.riskItem}>
                            • {risk}
                          </Text>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.aiPlaceholder}>
                <Text style={styles.aiPlaceholderText}>
                  {matchingLoading ? 'Đang phân tích dữ liệu...' : 'Chưa có kết quả phân tích'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {templateMatchingResults.length > 1 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleViewAlternatives}
            >
              <Text style={styles.secondaryButtonText}>Xem các mẫu khác</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.secondaryButton, { marginTop: 8 }]}
            onPress={() => router.replace('/quiz?redo=1')}
          >
            <Text style={styles.secondaryButtonText}>Làm lại khảo sát</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
    width: '100%',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusIcon: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.light.TEXT,
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 16,
    color: COLORS.light.INACTIVE,
    textAlign: 'center',
  },
  recommendationContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.light.TEXT,
  },
  aiLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiLoadingText: {
    fontSize: 14,
    color: COLORS.light.INACTIVE,
    marginLeft: 8,
  },
  aiPlaceholder: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  aiPlaceholderText: {
    fontSize: 16,
    color: COLORS.light.INACTIVE,
    textAlign: 'center',
  },
  templateResultContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.light.ACTIVE,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.ACTIVE,
    flex: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: COLORS.light.TEXT,
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.ACTIVE,
  },
  templateDescription: {
    fontSize: 14,
    color: COLORS.light.INACTIVE,
    lineHeight: 20,
    marginBottom: 8,
  },
  recommendationLevelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
  },
  recommendationLevelLabel: {
    fontSize: 14,
    color: COLORS.light.TEXT,
    fontWeight: '500',
  },
  recommendationLevelValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  matchingFactorsContainer: {
    marginTop: 12,
  },
  matchingFactorsTitle: {
    fontSize: 14,
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
    fontSize: 14,
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
    fontSize: 14,
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
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  primaryButton: {
    backgroundColor: COLORS.light.ACTIVE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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

export default QuizResultPage; 