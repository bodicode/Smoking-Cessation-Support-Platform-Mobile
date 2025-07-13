import { GET_HEALTH_SCORE_CRITERIA_QUERY } from "@/graphql/query/getHealthScoreCriteria";
import { GetHealthScoreCriteriaData } from "@/types/api/healthScoreCriteria";
import { useQuery } from "@apollo/client";

export const useHealthScoreCriteria = (coachId: string | null) => {
  const { loading, error, data, refetch } =
    useQuery<GetHealthScoreCriteriaData>(GET_HEALTH_SCORE_CRITERIA_QUERY, {
      variables: { coachId },
      skip: !coachId,
      fetchPolicy: "cache-and-network",
    });

  return {
    loading,
    error,
    criteriaList: data?.healthScoreCriteriaByCoach || [],
    refetch,
  };
};
