export interface HealthScoreCriteria {
  id: string;
  title: string;
  description: string;
  coach_id: string;
}

export interface GetHealthScoreCriteriaData {
  healthScoreCriteriaByCoach: HealthScoreCriteria[];
}
