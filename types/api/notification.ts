export type Notification = {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
};

export type NotificationListResponse = {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}; 