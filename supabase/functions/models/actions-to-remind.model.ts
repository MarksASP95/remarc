export interface ActionToRemind {
  created_at: string;
  description: string;
  entity_id: number;
  id: number;
  is_deleted: boolean;
  name: string;
  next_at: string;
  owner_uid: string;
  starts_at: string;
  time_interval_minutes: number;
  user_email: string;
  user_name: string;
  entity_name: string;
}