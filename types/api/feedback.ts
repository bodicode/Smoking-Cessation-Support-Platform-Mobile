export interface IPaginationParamsInput {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  sortOrder?: string;
}

export interface IFeedbackFiltersInput {
  templateId?: string;
}

export interface ICoach {
  id: string;
  name: string;
}

export interface ITemplate {
  id: string;
  name: string;
  coach: ICoach;
}

export interface IUser {
  id: string;
  name: string;
  role: string;
}

export interface IFeedback {
  id: string;
  rating: number;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  user: IUser | null;
  template: ITemplate;
}

export interface IGetFeedbacksVariables {
  params?: IPaginationParamsInput;
  filters?: IFeedbackFiltersInput;
}

export type IFeedbacksData = IFeedback[];
