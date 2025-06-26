export type Coach = {
  id: string;
  name: string;
};

export type Stage = {
  id: string;
  stage_order: number;
  title: string;
  description: string;
  recommended_actions: string;
  duration_days: number;
};

export type PlanTemplate = {
  id: string;
  name: string;
  estimated_duration_days: number;
  difficulty_level: string;
  description: string;
  total_reviews: number;
  success_rate: number;
  average_rating: number;
  created_at: string;
  coach: Coach;
  stages: Stage[];
};

export type PlanTemplatesResponse = {
  cessationPlanTemplates: {
    data: PlanTemplate[];
  };
};
