import { gql } from "@apollo/client";

export const GET_PLAN_STAGE_CHARTS = gql`
  query GetPlanStageCharts($planId: String!, $filters: PlanStageChartFiltersInput) {
    planStageChartsData(planId: $planId, filters: $filters) {
      plan_id
      plan_name
      total_stages
      stages {
        stage_id
        title
        max_cigarettes_per_day
        start_date
        end_date
        stage_order
        status
        total_days
        chart_data {
          date
          cigarettes_smoked
          exceeded_limit
        }
      }
    }
  }
`; 