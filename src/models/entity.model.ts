import { ModelDBData } from "./general.model";

export interface EntityCreate {
  name: string;
  description: string;
}
export interface Entity extends EntityCreate, ModelDBData {
  ownerId: number;
  ownerUID: string;
}

export interface EntityActionCreate {
  name: string;
  description: string;
  entityId: number;
  timeIntervalMinutes: number;
  nextAt: Date;
}
export interface EntityAction extends EntityActionCreate, ModelDBData {
  ownerId: string;
  ownerUID: string;
}


export type EntityActionEventStatus = "created" | "started" | "done" | "ignored" | "cancelled";

export interface EntityActionEventCreate {
  entityId: string;
  entityActionId: string;
  dueAt: number;
}
export interface EntityActionEvent extends EntityActionEventCreate, ModelDBData {
  status: EntityActionEventStatus;
  ownerId: string;
}

export type EntityEditable = Partial<Pick<Entity, "description" | "name" | "isDeleted">>;