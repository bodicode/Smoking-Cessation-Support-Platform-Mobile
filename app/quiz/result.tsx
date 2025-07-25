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
import { PlanTemplateService } from '@/services/templatePlanService';
import { QuizAttempt, AIRecommendation } from '@/types/api/quiz';

const QuizResultPage: React.FC = () => {
  const router = useRouter();
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [recommendedTemplate, setRecommendedTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadQuizResult();
  }, []);

  const loadQuizResult = async () => {
    try {
      setLoading(true);

      // Get quiz attempt
      const attempt = await QuizService.getQuizAttempt();
      if (!attempt) {
        Alert.alert('Thông báo', 'Không tìm thấy kết quả khảo sát.');
        router.back();
        return;
      }

      setQuizAttempt(attempt);
      setLoading(false);

      // Load AI recommendation in background
      loadAIRecommendation();
    } catch (error) {
      console.error('Error loading quiz result:', error);
      Alert.alert('Lỗi', 'Không thể tải kết quả khảo sát. Vui lòng thử lại.');
      router.back();
    }
  };

  const loadAIRecommendation = async () => {
    try {
      setAiLoading(true);

      // Get AI recommendation
      const recommendation = await QuizService.getAIRecommendation();
      setAiRecommendation(recommendation);

      // Get template details if recommendation exists
      if (recommendation && recommendation.recommendedTemplate) {
        try {
          const template = await PlanTemplateService.getTemplateById(recommendation.recommendedTemplate);
          setRecommendedTemplate(template);
        } catch (templateError) {
          console.error('Error loading template details:', templateError);
          // Continue without template details
        }
      }
    } catch (aiError) {
      console.error('Error loading AI recommendation:', aiError);
      // Continue without AI recommendation
      setAiRecommendation(null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleStartPlan = () => {
    // Navigate to plan creation with recommended template
    if (aiRecommendation) {
      router.push(`/template/${aiRecommendation.recommendedTemplate}` as any);
    }
  };

  const handleViewAlternatives = () => {
    // Show alternative templates
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
          {/* Completion Status */}
          <View style={styles.statusContainer}>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons name="check-circle" size={48} color="#4CAF50" />
            </View>
            <Text style={styles.statusTitle}>Hoàn thành khảo sát!</Text>
            <Text style={styles.statusSubtitle}>
              Bạn đã hoàn thành khảo sát vào {completedDate}
            </Text>
          </View>

          {/* AI Recommendation */}
          <View style={styles.recommendationContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Gợi ý từ AI</Text>
              {aiLoading && (
                <View style={styles.aiLoadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.light.ACTIVE} />
                  <Text style={styles.aiLoadingText}>Đang phân tích...</Text>
                </View>
              )}
            </View>
            
            {aiRecommendation ? (
              <>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>Độ tin cậy:</Text>
                  <Text style={styles.confidenceValue}>
                    {Math.round(aiRecommendation.confidence * 100)}%
                  </Text>
                </View>

                <View style={styles.templateContainer}>
                  <Text style={styles.templateLabel}>Template được đề xuất:</Text>
                  <Text style={styles.templateName}>
                    {recommendedTemplate ? recommendedTemplate.name : aiRecommendation.recommendedTemplate}
                  </Text>
                  {recommendedTemplate && (
                    <Text style={styles.templateDescription}>
                      {recommendedTemplate.description}
                    </Text>
                  )}
                </View>

                {/* Reasoning */}
                <View style={styles.reasoningContainer}>
                  <Text style={styles.reasoningTitle}>Lý do đề xuất:</Text>
                  
                  {aiRecommendation.reasoning.considerations.length > 0 && (
                    <View style={styles.reasoningSection}>
                      <Text style={styles.reasoningSubtitle}>Các yếu tố được xem xét:</Text>
                      {aiRecommendation.reasoning.considerations.map((item, index) => (
                        <Text key={index} style={styles.reasoningItem}>• {item}</Text>
                      ))}
                    </View>
                  )}

                  {aiRecommendation.reasoning.matchingFactors.length > 0 && (
                    <View style={styles.reasoningSection}>
                      <Text style={styles.reasoningSubtitle}>Yếu tố phù hợp:</Text>
                      {aiRecommendation.reasoning.matchingFactors.map((item, index) => (
                        <Text key={index} style={styles.reasoningItem}>• {item}</Text>
                      ))}
                    </View>
                  )}

                  {aiRecommendation.reasoning.suggestions.length > 0 && (
                    <View style={styles.reasoningSection}>
                      <Text style={styles.reasoningSubtitle}>Gợi ý:</Text>
                      {aiRecommendation.reasoning.suggestions.map((item, index) => (
                        <Text key={index} style={styles.reasoningItem}>• {item}</Text>
                      ))}
                    </View>
                  )}

                  {aiRecommendation.reasoning.risks.length > 0 && (
                    <View style={styles.reasoningSection}>
                      <Text style={styles.reasoningSubtitle}>Lưu ý:</Text>
                      {aiRecommendation.reasoning.risks.map((item, index) => (
                        <Text key={index} style={[styles.reasoningItem, styles.riskItem]}>• {item}</Text>
                      ))}
                    </View>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.aiPlaceholder}>
                <Text style={styles.aiPlaceholderText}>
                  {aiLoading ? 'Đang phân tích dữ liệu...' : 'Chưa có gợi ý từ AI'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
          {aiRecommendation && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartPlan}
            >
              <Text style={styles.primaryButtonText}>Xem chi tiết kế hoạch được gợi ý</Text>
            </TouchableOpacity>
          )}

          {aiRecommendation && aiRecommendation.alternativeTemplates.length > 0 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleViewAlternatives}
            >
              <Text style={styles.secondaryButtonText}>Xem các mẫu khác</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.secondaryButton, { marginTop: 8 }]}
          onPress={() => router.replace('/quiz?redo=1')}
        >
          <Text style={styles.secondaryButtonText}>Làm lại khảo sát</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
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
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },
  confidenceLabel: {
    fontSize: 16,
    color: COLORS.light.TEXT,
    fontWeight: '500',
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.ACTIVE,
  },
  templateContainer: {
    marginBottom: 4,
  },
  templateLabel: {
    fontSize: 16,
    color: COLORS.light.TEXT,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.ACTIVE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    color: COLORS.light.INACTIVE,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  reasoningContainer: {
    marginTop: 8,
  },
  reasoningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.TEXT,
    marginBottom: 12,
  },
  reasoningSection: {
    marginBottom: 16,
  },
  reasoningSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light.TEXT,
    marginBottom: 8,
  },
  reasoningItem: {
    fontSize: 14,
    color: COLORS.light.TEXT,
    marginBottom: 4,
    lineHeight: 20,
  },
  riskItem: {
    color: '#D32F2F',
  },
  summaryContainer: {
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
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: COLORS.light.TEXT,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.ACTIVE,
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