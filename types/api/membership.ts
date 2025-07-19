export interface IMembershipPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  duration_days: number;
  features?: string[];
  is_popular?: boolean;
  created_at: string;
  updated_at: string;
}
