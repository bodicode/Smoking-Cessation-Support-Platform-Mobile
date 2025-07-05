import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ICessationPlan } from "@/types/api/myPlan";
import { IProgressRecord } from "@/types/api/processRecord";
import { CessationPlanService } from "@/services/myPlanService";
import { ProgressRecordService } from "@/services/processRecordService";
import { useAuth } from "@/contexts/AuthContext";

interface ProgressContextValue {
  activePlan: ICessationPlan | null;
  progressRecords: IProgressRecord[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(
  undefined
);

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};

export const ProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, logout } = useAuth();
  const [activePlan, setActivePlan] = useState<ICessationPlan | null>(null);
  const [progressRecords, setProgressRecords] = useState<IProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!user?.id) {
      setActivePlan(null);
      setProgressRecords([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const plans = await CessationPlanService.getCessationPlans({
        filters: { user_id: user.id },
      });

      let selectedPlan = plans
        .filter((p) => p.status === "ACTIVE")
        .sort(
          (a, b) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        )[0];

      if (!selectedPlan) {
        const completedPlans = plans.filter((p) => p.status === "COMPLETED");
        selectedPlan = completedPlans.sort(
          (a, b) =>
            new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        )[0];
      }

      setActivePlan(selectedPlan ?? null);

      if (selectedPlan) {
        const records = await ProgressRecordService.getRecords({
          filters: { planId: selectedPlan.id },
        });

        const sortedRecords = records.sort(
          (a, b) =>
            new Date(b.record_date).getTime() -
            new Date(a.record_date).getTime()
        );
        setProgressRecords(sortedRecords ?? []);
      } else {
        setProgressRecords([]);
      }
    } catch (err: any) {
      console.error("Error refreshing progress data:", err);
      if (err.message?.includes("Invalid or expired token")) {
        logout();
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(err.message || "Không thể tải dữ liệu tiến độ.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, logout]);

  useEffect(() => {
    if (user?.id) {
      refreshData();
    } else {
      setActivePlan(null);
      setProgressRecords([]);
      setLoading(false);
      setError(null);
    }
  }, [user?.id, refreshData]);

  return (
    <ProgressContext.Provider
      value={{ activePlan, progressRecords, loading, error, refreshData }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
