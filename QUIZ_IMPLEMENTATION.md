# Quiz Implementation Guide

## 📋 Overview

Đã implement hoàn chỉnh hệ thống quiz với flow:
1. **Start Quiz** - Tạo attempt khi user bắt đầu làm quiz
2. **Submit Quiz** - Submit answers khi user hoàn thành

## 🔧 API Flow

### 1. Start Quiz
```graphql
mutation($startQuizInput: StartQuizInput!) {
  startQuiz(input: $startQuizInput) {
    id
    member_profile_id
    quiz_id
    created_at
    completed_at
    responses {
      answer
      attempt_id
      created_at
      id
      question_id
      updated_at
    }
    started_at
    status
    updated_at
    user_id
  }
}
```

### 2. Submit Quiz
```graphql
mutation($input: SubmitQuizInput!) {
  submitQuiz(input: $input) {
    attempt_id
    member_profile_updated
    message
    responses {
      answer
      attempt_id
      created_at
      id
      question_id
      updated_at
      order
    }
  }
}
```

## 📁 Files Structure

```
├── types/api/quiz.ts                    # Quiz type definitions
├── graphql/query/getProfileQuizzes.ts   # Query to get quizzes
├── graphql/mutation/startQuiz.ts        # Start quiz mutation
├── graphql/mutation/submitQuizAnswers.ts # Submit quiz mutation
├── services/quizService.ts              # Quiz service methods
├── app/quiz/index.tsx                   # Quiz page UI
├── components/home/QuizCard.tsx         # Quiz card component
└── components/home/header.tsx           # Header with quiz icon
```

## 🎯 Features

### Quiz Types Supported
- **NUMBER**: Input số
- **TEXT**: Input text
- **MULTIPLE_CHOICE**: Chọn nhiều đáp án
- **SCALE**: Chọn thang điểm (1-5)
- **BOOLEAN**: Có/Không

### UI Features
- Progress bar hiển thị tiến độ
- Navigation giữa các câu hỏi
- Validation câu hỏi bắt buộc
- Loading states
- Error handling
- Responsive design

## 🚀 Usage

### 1. Access Quiz
- Click icon quiz (clipboard) trong header
- Hoặc navigate đến `/quiz`

### 2. Quiz Flow
1. Load active quiz
2. Start quiz attempt
3. User answers questions
4. Submit answers
5. Show success message

### 3. Service Methods

```typescript
// Get all profile quizzes
const quizzes = await QuizService.getProfileQuizzes();

// Get active quiz
const activeQuiz = await QuizService.getActiveProfileQuiz();

// Start quiz
const attempt = await QuizService.startQuiz(quizId);

// Submit quiz
const result = await QuizService.submitQuiz(attemptId, responses);
```

## 📊 Data Format

### Quiz Structure
```typescript
interface ProfileQuiz {
  id: string;
  description: string;
  title: string;
  is_active: boolean;
  questions: QuizQuestion[];
  updated_at: string;
  created_at: string;
}
```

### Question Types
```typescript
interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: 'NUMBER' | 'TEXT' | 'MULTIPLE_CHOICE' | 'SCALE' | 'BOOLEAN';
  is_required: boolean;
  options: string[] | null;
  validation_rule: any;
  order: number;
}
```

### Submit Response Format
```typescript
interface QuizResponseInput {
  question_id: string;
  answer: string | number | string[] | boolean;
}
```

## 🎨 UI Components

### QuizCard
- Hiển thị thông tin quiz
- Số câu hỏi và thời gian ước tính
- Navigate đến quiz page

### Quiz Page
- Progress bar
- Question rendering theo type
- Navigation buttons
- Submit functionality

## 🔄 State Management

### Quiz Page States
- `quiz`: Thông tin quiz
- `quizAttempt`: Thông tin attempt
- `answers`: User answers
- `currentQuestionIndex`: Câu hỏi hiện tại
- `loading`: Loading state
- `submitting`: Submit state

## ✅ Validation

### Required Questions
- Kiểm tra tất cả câu hỏi bắt buộc đã được trả lời
- Hiển thị alert nếu chưa hoàn thành

### Answer Types
- NUMBER: Validate số
- TEXT: Validate text length
- MULTIPLE_CHOICE: Validate array
- SCALE: Validate scale value
- BOOLEAN: Validate boolean

## 🐛 Error Handling

### Network Errors
- Retry mechanism
- User-friendly error messages
- Fallback to previous state

### Validation Errors
- Clear error messages
- Highlight required fields
- Prevent submission until valid

## 🎯 Next Steps

1. **Add Quiz History**: Lưu lịch sử làm quiz
2. **Quiz Analytics**: Thống kê kết quả
3. **Quiz Templates**: Tạo quiz templates
4. **Offline Support**: Làm quiz offline
5. **Push Notifications**: Remind user to take quiz

## 📱 Testing

### Test Cases
1. Load quiz successfully
2. Start quiz attempt
3. Answer all question types
4. Submit quiz successfully
5. Handle network errors
6. Validate required questions
7. Navigate between questions
8. Handle quiz completion

### Manual Testing
1. Click quiz icon in header
2. Complete quiz with different question types
3. Test validation for required questions
4. Test error scenarios
5. Verify successful submission 