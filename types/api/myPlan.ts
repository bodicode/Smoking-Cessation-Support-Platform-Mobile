export interface IPaginationParamsInput {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  sortOrder?: string;
}
export interface ICessationPlanFiltersInput {
  user_id?: string;
  status?: string;
}
export interface IGetCessationPlansVariables {
  params?: IPaginationParamsInput;
  filters?: ICessationPlanFiltersInput;
}

export interface IUser {
  id: string;
  name: string;
  role: string;
}

export interface ICessationPlanTemplate {
  id: string;
  name: string;
  coach_id: string;
}

export interface ICessationPlanStage {
  max_cigarettes_per_day: number;
  id: string;
  title: string;
  stage_order: number;
  description: string;
  actions: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface ICessationPlan {
  id: string;
  template: ICessationPlanTemplate;
  reason: string;
  status: string;
  start_date: string;
  target_date: string;
  days_since_start: number;
  completion_percentage: number;
  is_custom: boolean;
  user: IUser;
  stages: ICessationPlanStage[];
}

export interface ICreateCessationPlanInput {
  template_id: string;
  reason: string;
  start_date: string;
  target_date: string;
  is_custom: boolean;
}

export interface UpdatePlanStageInput {
  id: string;
  title?: string;
  description?: string;
  actions?: string;
  start_date?: string;
  end_date?: string;
  stage_order?: number;
  status?: string;
}

export type ICessationPlansData = ICessationPlan[];
