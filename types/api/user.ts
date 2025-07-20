export interface CoachProfile {
  id: string;
  user_id: string;
  approach_description: string;
  average_rating: number;
  certifications: string[];
  education: string;
  experience_years: number;
  professional_bio: string;
  specializations: string[];
  success_rate: number;
  total_clients: number;
  total_sessions: number;
  created_at: string;
  updated_at: string;
}

export interface MemberProfile {
  id: string;
  user_id: string;
  allergies: string[];
  brand_preference: string;
  cigarettes_per_day: number;
  daily_routine: {
    wake_time: string;
    work_type: string;
    sleep_time: string;
  };
  health_conditions: string[];
  medications: string[];
  nicotine_level: number;
  preferred_support: string[];
  previous_attempts: number;
  price_per_pack: number;
  quit_motivation: string;
  recorded_at: string;
  sessions_per_day: number;
  smoking_years: number;
  social_support: boolean;
  stress_level: number;
  trigger_factors: string[];
}

export interface User {
  id: string;
  avatar_url?: string;
  name?: string;
  email?: string;
  coach_profile?: CoachProfile[];
  member_profile?: MemberProfile[];
  created_at: string;
}
