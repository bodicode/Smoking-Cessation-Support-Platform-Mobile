import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import COLORS from '@/constants/Colors';
import { QuizService } from '@/services/quizService';
import { ProfileQuiz } from '@/types/api/quiz';

const QuizCard: React.FC = () => {
  const router = useRouter();
  const [quiz, setQuiz] = useState<ProfileQuiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveQuiz();
  }, []);

  const loadActiveQuiz = async () => {
    try {
      setLoading(true);
      const activeQuiz = await QuizService.getActiveProfileQuiz();
      setQuiz(activeQuiz);
    } catch (error) {
      console.error('Error loading active quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = () => {
    router.push('/quiz' as any);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.light.ACTIVE} />
      </View>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handleTakeQuiz}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name="clipboard-text" 
          size={24} 
          color="#fff" 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Khảo sát thói quen</Text>
        <Text style={styles.description} numberOfLines={2}>
          Khảo sát để hiểu rõ thói quen hút thuốc và tình trạng sức khỏe của bạn
        </Text>
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {quiz.questions.length} câu hỏi
          </Text>
          <Text style={styles.timeText}>~5 phút</Text>
        </View>
      </View>
      
      <View style={styles.arrowContainer}>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={24} 
          color={COLORS.light.INACTIVE} 
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
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
  loadingContainer: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.light.ACTIVE,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.TEXT,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: COLORS.light.INACTIVE,
    marginBottom: 8,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    color: COLORS.light.ACTIVE,
    fontWeight: '500',
    marginRight: 12,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.light.INACTIVE,
  },
  arrowContainer: {
    marginLeft: 8,
  },
});

export default QuizCard; 