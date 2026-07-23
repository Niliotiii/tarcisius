export interface QuestionOption {
  id: string
  label: string
  image?: QuestionImage
}

export interface QuestionImage {
  src: string
  alt: string
}

export interface Question {
  id: string
  prompt: string
  image?: QuestionImage
  options: QuestionOption[]
  correctOptionId: string
}

export type ModuleStatus = 'available' | 'locked'

export interface Module {
  id: string
  title: string
  subtitle: string
  description: string
  status: ModuleStatus
  questions: Question[]
}

export interface RankTier {
  minScore: number
  maxScore: number
  title: string
  description: string
  stars: number
}

export interface AnsweredQuestion {
  questionId: string
  selectedOptionId: string
  correct: boolean
}

export interface QuizSession {
  moduleId: string
  questions: Question[]
  currentIndex: number
  answers: AnsweredQuestion[]
}
