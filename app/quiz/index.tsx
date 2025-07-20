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
import { useRouter, Stack } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '@/constants/Colors';
import { QuizService } from '@/services/quizService';
import { ProfileQuiz, QuizQuestion } from '@/types/api/quiz';
import { QuizResponseInput } from '@/graphql/mutation/submitQuizAnswers';

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
  const [quiz, setQuiz] = useState<ProfileQuiz | null>(null);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      setLoading(true);

      const existingAttempts = await QuizService.getQuizAttempt();

      const completedAttempt = Array.isArray(existingAttempts)
        ? existingAttempts.find(attempt => attempt.status === 'COMPLETED' && attempt.completed_at)
        : null;

      if (completedAttempt) {
        router.replace('/quiz/result');
        return;
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
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Nhập câu trả lời"
            value={currentAnswer?.toString() || ''}
            onChangeText={(text) => handleAnswerChange(question.id, text)}
          />
        );

      case 'MULTIPLE_CHOICE':
        return (
          <View style={styles.optionsContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  Array.isArray(currentAnswer) && currentAnswer.includes(option) && styles.selectedOption
                ]}
                onPress={() => {
                  const currentAnswers = Array.isArray(currentAnswer) ? currentAnswer : [];
                  if (currentAnswers.includes(option)) {
                    handleAnswerChange(question.id, currentAnswers.filter(a => a !== option));
                  } else {
                    handleAnswerChange(question.id, [...currentAnswers, option]);
                  }
                }}
              >
                <Text style={[
                  styles.optionText,
                  Array.isArray(currentAnswer) && currentAnswer.includes(option) && styles.selectedOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'SCALE':
        return (
          <View style={styles.scaleContainer}>
            {question.options?.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.scaleButton,
                  currentAnswer === option && styles.selectedScale
                ]}
                onPress={() => handleAnswerChange(question.id, option)}
              >
                <Text style={[
                  styles.scaleText,
                  currentAnswer === option && styles.selectedScaleText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'BOOLEAN':
        return (
          <View style={styles.booleanContainer}>
            <TouchableOpacity
              style={[
                styles.booleanButton,
                currentAnswer === true && styles.selectedBoolean
              ]}
              onPress={() => handleAnswerChange(question.id, true)}
            >
              <Text style={[
                styles.booleanText,
                currentAnswer === true && styles.selectedBooleanText
              ]}>
                Có
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.booleanButton,
                currentAnswer === false && styles.selectedBoolean
              ]}
              onPress={() => handleAnswerChange(question.id, false)}
            >
              <Text style={[
                styles.booleanText,
                currentAnswer === false && styles.selectedBooleanText
              ]}>
                Không
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
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
      // Convert answers to the format expected by the API
      const responses: QuizResponseInput[] = answers.map(answer => ({
        question_id: answer.questionId,
        answer: answer.answer,
      }));

      const result = await QuizService.submitQuiz(quizAttempt.attempt_id, responses);

      if (result.member_profile_updated) {
        Alert.alert('Cảm ơn bạn đã hoàn thành khảo sát!');
      } else {
        Alert.alert('Thành công', 'Cảm ơn bạn đã hoàn thành khảo sát!');
      }

      // Redirect to result page after successful submission
      router.replace('/quiz/result' as any);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Lỗi', 'Không thể gửi khảo sát. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.light.ACTIVE} />
          <Text style={styles.loadingText}>Đang tải khảo sát...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!quiz) {
    return null;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Khảo sát thói quen",
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
      <SafeAreaView style={styles.container}>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Câu hỏi {currentQuestionIndex + 1} / {quiz.questions.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
                ]}
              />
            </View>
          </View>

          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
            {currentQuestion.description && (
              <Text style={styles.questionDescription}>{currentQuestion.description}</Text>
            )}

            <View style={styles.answerContainer}>
              {renderQuestion(currentQuestion)}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
              <Text style={styles.previousButtonText}>Trước</Text>
            </TouchableOpacity>
          )}

          {isLastQuestion ? (
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Hoàn thành</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>Tiếp theo</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.BG,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.TEXT,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  progressContainer: {
    marginVertical: 20,
  },
  progressText: {
    fontSize: 14,
    color: COLORS.light.INACTIVE,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.light.ACTIVE,
    borderRadius: 2,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.TEXT,
    marginBottom: 8,
    lineHeight: 24,
  },
  questionDescription: {
    fontSize: 14,
    color: COLORS.light.INACTIVE,
    marginBottom: 20,
    lineHeight: 20,
  },
  answerContainer: {
    marginTop: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  selectedOption: {
    borderColor: COLORS.light.ACTIVE,
    backgroundColor: COLORS.light.ACTIVE,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.light.TEXT,
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  scaleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedScale: {
    borderColor: COLORS.light.ACTIVE,
    backgroundColor: COLORS.light.ACTIVE,
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
    gap: 12,
  },
  booleanButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectedBoolean: {
    borderColor: COLORS.light.ACTIVE,
    backgroundColor: COLORS.light.ACTIVE,
  },
  booleanText: {
    fontSize: 16,
    color: COLORS.light.TEXT,
  },
  selectedBooleanText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  previousButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.light.ACTIVE,
    borderRadius: 8,
  },
  previousButtonText: {
    color: COLORS.light.ACTIVE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: COLORS.light.ACTIVE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: COLORS.light.ACTIVE,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default QuizPage; 