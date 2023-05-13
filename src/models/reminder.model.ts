import { ModelDBData } from './general.model';

export type ReminderStatus = "created" | "expired";

export interface ReminderCreate {
  entityActionId: string;
  entityActionEventId: string;
  entityId: string;
}
export interface Reminder extends ReminderCreate, ModelDBData {
  status: ReminderStatus;
  ownerId: string;
}