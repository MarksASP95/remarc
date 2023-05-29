export interface ModelDBData {
  id: number;
  createdAt: Date;
  isDeleted: boolean;
}

export type TimeUnit = "minutes" | "hours" | "days" | "weeks" | "months";