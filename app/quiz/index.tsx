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
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.light.ACTIVE} />
      </SafeAreaView>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <Stack.Screen options={{ title: 'Khảo sát' }} />
      <ScrollView style={{ flex: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{currentQuestion.question_text}</Text>
        {renderQuestion(currentQuestion)}
      </ScrollView>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} style={{ padding: 12, backgroundColor: '#ddd', borderRadius: 8 }}>
            <Text>Trước</Text>
          </TouchableOpacity>
        )}
        {!isLastQuestion ? (
          <TouchableOpacity onPress={goToNext} style={{ padding: 12, backgroundColor: COLORS.light.ACTIVE, borderRadius: 8 }}>
            <Text style={{ color: '#fff' }}>Tiếp theo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={{ padding: 12, backgroundColor: COLORS.light.ACTIVE, borderRadius: 8, opacity: submitting ? 0.6 : 1 }}>
            <Text style={{ color: '#fff' }}>{submitting ? 'Đang gửi...' : 'Gửi'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  selectedOption: {
    backgroundColor: COLORS.light.ACTIVE,
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    color: '#fff',
  },
  scaleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  scaleButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    flex: 1,
    alignItems: 'center',
  },
  selectedScale: {
    backgroundColor: COLORS.light.ACTIVE,
  },
  scaleText: {
    fontSize: 16,
  },
  selectedScaleText: {
    color: '#fff',
  },
  booleanContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  booleanButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selectedBoolean: {
    backgroundColor: COLORS.light.ACTIVE,
  },
  booleanText: {
    fontSize: 16,
  },
  selectedBooleanText: {
    color: '#fff',
  },
});

export default QuizPage;
