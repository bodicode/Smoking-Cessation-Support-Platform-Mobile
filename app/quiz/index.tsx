// Improved QuizPage.tsx with TimePickerInput, validation, and full submit logic
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import COLORS from '@/constants/Colors';
import { QuizService } from '@/services/quizService';
import { ProfileQuiz, QuizQuestion } from '@/types/api/quiz';
import { QuizResponseInput } from '@/graphql/mutation/submitQuizAnswers';
import TimePickerInput from '@/components/common/TimePickerInput';

interface QuizAnswer {
  questionId: string;
  answer: string | number | string[] | boolean;
}

interface QuizAttempt {
  id: string;
  attempt_id: string;
  quiz_id: string;
  status: string;
}

const QuizPage: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [quiz, setQuiz] = useState<ProfileQuiz | null>(null);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showRecommendationLoading, setShowRecommendationLoading] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const singleChoiceIds = ['7e872d18-e656-46fe-b820-cc7c37481b46'];

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const redo = String(params?.redo) === '1';
      if (!redo) {
        const existingAttempts = await QuizService.getQuizAttempt();
        const completedAttempt = Array.isArray(existingAttempts)
          ? existingAttempts.find(attempt => attempt.status === 'COMPLETED' && attempt.completed_at)
          : null;
        if (completedAttempt) {
          router.replace('/quiz/result');
          return;
        }
      }
      const activeQuiz = await QuizService.getActiveProfileQuiz();
      if (activeQuiz) {
        setQuiz(activeQuiz);
        const attempt = await QuizService.startQuiz(activeQuiz.id);
        setQuizAttempt({
          id: attempt.id,
          attempt_id: attempt.id,
          quiz_id: attempt.quiz_id,
          status: attempt.status,
        });
      } else {
        Alert.alert('Thông báo', 'Không có khảo sát nào đang hoạt động.');
        router.back();
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Lỗi', 'Không thể tải khảo sát. Vui lòng thử lại.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const newAnswers = [...prev];
        newAnswers[existingIndex] = { questionId, answer };
        return newAnswers;
      } else {
        return [...prev, { questionId, answer }];
      }
    });
  };

  const getCurrentAnswer = (questionId: string) => {
    const answer = answers.find(a => a.questionId === questionId);
    return answer?.answer;
  };

  const renderQuestion = (question: QuizQuestion) => {
    const currentAnswer = getCurrentAnswer(question.id);
    const isTimeQuestion = question.question_text.toLowerCase().includes("lúc mấy giờ");

    switch (question.question_type) {
      case 'NUMBER':
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Nhập số"
            keyboardType="numeric"
            value={currentAnswer?.toString() || ''}
            onChangeText={(text) => handleAnswerChange(question.id, text ? parseInt(text) : '')}
          />
        );
      case 'TEXT':
        if (isTimeQuestion) {
          return (
            <TimePickerInput
              value={currentAnswer?.toString() || ''}
              onChange={(time) => handleAnswerChange(question.id, time)}
            />
          );
        }
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Nhập câu trả lời"
            value={currentAnswer?.toString() || ''}
            onChangeText={(text) => handleAnswerChange(question.id, text)}
          />
        );
      case 'MULTIPLE_CHOICE':
        const isSingleSelect = singleChoiceIds.includes(question.id);
        if (isSingleSelect) {
          return (
            <View style={styles.optionsContainer}>
              {question.options?.map((option, index) => {
                const selected = currentAnswer === option;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionButton, selected && styles.selectedOption]}
                    onPress={() => handleAnswerChange(question.id, option)}
                  >
                    <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        } else {
          return (
            <View style={styles.optionsContainer}>
              {question.options?.map((option, index) => {
                const selected = Array.isArray(currentAnswer) && currentAnswer.includes(option);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionButton, selected && styles.selectedOption]}
                    onPress={() => {
                      const answers = Array.isArray(currentAnswer) ? currentAnswer : [];
                      handleAnswerChange(
                        question.id,
                        selected ? answers.filter(a => a !== option) : [...answers, option]
                      );
                    }}
                  >
                    <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        }
      case 'SCALE':
        return (
          <View style={styles.scaleContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.scaleButton, currentAnswer === option && styles.selectedScale]}
                onPress={() => handleAnswerChange(question.id, option)}
              >
                <Text style={[styles.scaleText, currentAnswer === option && styles.selectedScaleText]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      case 'BOOLEAN':
        return (
          <View style={styles.booleanContainer}>
            {[true, false].map(value => (
              <TouchableOpacity
                key={String(value)}
                style={[styles.booleanButton, currentAnswer === value && styles.selectedBoolean]}
                onPress={() => handleAnswerChange(question.id, value)}
              >
                <Text style={[styles.booleanText, currentAnswer === value && styles.selectedBooleanText]}>
                  {value ? 'Có' : 'Không'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  const goToNext = () => {
    const currentQuestion = quiz?.questions[currentQuestionIndex];
    const currentAnswer = getCurrentAnswer(currentQuestion?.id || '');
    if (currentAnswer === undefined || currentAnswer === null || currentAnswer === '' || (Array.isArray(currentAnswer) && currentAnswer.length === 0)) {
      Alert.alert('Thông báo', 'Vui lòng trả lời câu hỏi trước khi tiếp tục.');
      return;
    }
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleSubmit = async () => {
    const requiredQuestions = quiz?.questions.filter(q => q.is_required) || [];
    const answeredRequired = requiredQuestions.every(q =>
      answers.some(a => a.questionId === q.id && a.answer !== '' && a.answer !== null && a.answer !== undefined)
    );
    if (!answeredRequired) {
      Alert.alert('Thông báo', 'Vui lòng trả lời tất cả câu hỏi bắt buộc.');
      return;
    }
    if (!quizAttempt) {
      Alert.alert('Lỗi', 'Không tìm thấy phiên làm bài. Vui lòng thử lại.');
      return;
    }
    setSubmitting(true);
    try {
      const responses: QuizResponseInput[] = answers.map(answer => ({
        question_id: answer.questionId,
        answer: answer.answer,
      }));
      await QuizService.submitQuiz(quizAttempt.attempt_id, responses);
      await QuizService.getAIRecommendation();
      router.replace('/quiz/result');
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Lỗi', 'Không thể gửi khảo sát. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !quiz || showRecommendationLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.ACTIVE} />
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: 'Khảo sát' }} />
      <ScrollView style={styles.scroll}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
          {renderQuestion(currentQuestion)}
        </View>
      </ScrollView>
      <View style={styles.buttonRow}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity
            onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            style={[styles.navButton, styles.prevButton]}
          >
            <Text style={styles.prevButtonText}>Trước</Text>
          </TouchableOpacity>
        )}
        {!isLastQuestion ? (
          <TouchableOpacity
            onPress={goToNext}
            style={[styles.navButton, styles.nextButton]}
          >
            <Text style={styles.navButtonText}>Tiếp theo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={[
              styles.navButton,
              styles.submitButton,
              submitting && styles.disabledButton,
            ]}
          >
            <Text style={styles.navButtonText}>
              {submitting ? 'Đang gửi...' : 'Gửi'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light.BG,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 0,
  },
  questionCard: {
    backgroundColor: COLORS.light.CARD_BG,
    borderRadius: 18,
    padding: 22,
    margin: 18,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  questionText: {
    fontSize: 19,
    fontWeight: 'bold',
    color: COLORS.light.TEXT,
    marginBottom: 18,
    textAlign: 'left',
    lineHeight: 26,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
  },
  optionsContainer: {
    gap: 14,
    marginBottom: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
  },
  selectedOption: {
    backgroundColor: COLORS.light.ACTIVE,
    borderColor: COLORS.light.ACTIVE,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.light.TEXT,
    textAlign: 'left',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scaleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  scaleButton: {
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 0,
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
  },
  selectedScale: {
    backgroundColor: COLORS.light.ACTIVE,
    borderColor: COLORS.light.ACTIVE,
  },
  scaleText: {
    fontSize: 16,
    color: COLORS.light.TEXT,
  },
  selectedScaleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  booleanContainer: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 10,
  },
  booleanButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
  },
  selectedBoolean: {
    backgroundColor: COLORS.light.ACTIVE,
    borderColor: COLORS.light.ACTIVE,
  },
  booleanText: {
    fontSize: 16,
    color: COLORS.light.TEXT,
  },
  selectedBooleanText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    backgroundColor: COLORS.light.BG,
  },
  navButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  prevButton: {
    backgroundColor: COLORS.light.LIGHT_GREY_BG,
    borderWidth: 1,
    borderColor: COLORS.light.BORDER_LIGHT_GREY,
  },
  nextButton: {
    backgroundColor: COLORS.light.ACTIVE,
  },
  submitButton: {
    backgroundColor: COLORS.light.PRIMARY_GREEN,
  },
  disabledButton: {
    opacity: 0.6,
  },
  navButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  prevButtonText: {
    color: COLORS.light.TEXT, // Make back button text visible
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default QuizPage;
