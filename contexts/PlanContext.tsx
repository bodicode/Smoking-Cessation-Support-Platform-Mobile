import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CessationPlanService } from "@/services/myPlanService";
import { useAuth } from "@/contexts/AuthContext";
import {
  IPaginationParamsInput,
  ICessationPlanFiltersInput,
} from "@/types/api/myPlan";

interface PlanCountContextType {
  planCount: number;
  loadingPlansCount: boolean;
  errorLoadingPlansCount: string | null;
  refetchPlanCount: () => void;
}

const PlanCountContext = createContext<PlanCountContextType | undefined>(
  undefined
);

interface PlanCountProviderProps {
  children: ReactNode;
}

export const PlanCountProvider = ({ children }: PlanCountProviderProps) => {
  const [planCount, setPlanCount] = useState(0);
  const [loadingPlansCount, setLoadingPlansCount] = useState(true);
  const [errorLoadingPlansCount, setErrorLoadingPlansCount] = useState<
    string | null
  >(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  const currentUserId = user?.id;

  const fetchPlansCount = async () => {
    if (!currentUserId) {
      setLoadingPlansCount(false);
      return;
    }

    try {
      setLoadingPlansCount(true);
      setErrorLoadingPlansCount(null);

      const params: IPaginationParamsInput = {
        page: 1,
        limit: 1,
      };

      const filters: ICessationPlanFiltersInput = {
        user_id: currentUserId,
      };

      const data = await CessationPlanService.getCessationPlans({
        params,
        filters,
      });
      setPlanCount(data.length > 0 ? 1 : 0);
    } catch (err: any) {
      setErrorLoadingPlansCount(err.message || "Failed to load plan count.");
      setPlanCount(0);
    } finally {
      setLoadingPlansCount(false);
    }
  };

  useEffect(() => {
    fetchPlansCount();
  }, [currentUserId, refreshKey]);

  const refetchPlanCount = () => {
    setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
    <PlanCountContext.Provider
      value={{
        planCount,
        loadingPlansCount,
        errorLoadingPlansCount,
        refetchPlanCount,
      }}
    >
      {children}
    </PlanCountContext.Provider>
  );
};

export const usePlanCount = () => {
  const context = useContext(PlanCountContext);
  if (context === undefined) {
    throw new Error("usePlanCount must be used within a PlanCountProvider");
  }
  return context;
};
