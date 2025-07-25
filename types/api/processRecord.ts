export interface IProgressRecordFiltersInput {
  planId?: string;
}

export interface IGetRecordsVariables {
  params?: IPaginationParamsInput;
  filters?: IProgressRecordFiltersInput;
}

export interface IPaginationParamsInput {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: string;
  sortOrder?: string;
}

export interface IProgressRecord {
  id: string;
  cigarettes_smoked: number;
  health_score: number;
  notes: string;
  record_date: string;
}

export type IProgressRecordsData = IProgressRecord[];

export interface IProgressRecord {
  id: string;
  cigarettes_smoked: number;
  health_score: number;
  notes: string;
  // is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface ICreateProgressRecordInput {
  plan_id: string;
  cigarettes_smoked: number;
  health_score: number;
  notes: string;
  record_date: string;
}

export interface IUpdateProgressRecordInput {
  id: string;
  cigarettes_smoked: number;
  health_score: number;
  notes: string;
}
