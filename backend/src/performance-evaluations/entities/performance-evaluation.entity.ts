export enum EvaluationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  APPROVED = 'approved',
}

export class PerformanceEvaluation {
  id: string;
  period: string;
  score: number;
  goals?: string;
  achievements?: string;
  feedback?: string;
  status: EvaluationStatus;
  createdAt: Date;
  updatedAt: Date;
  evaluator_id: string;
  user_id: string;
}