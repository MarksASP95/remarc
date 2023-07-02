import { Entity, EntityAction, EntityActionCreate, EntityCreate } from "@/models/entity.model";
import { supabaseAdmin } from '../db/supabase';

export class EntityController {

  ownerUID: string;
  constructor(ownerUID: string) {
    this.ownerUID = ownerUID;
  }

  async getEntity(id: number): Promise<Entity | undefined> {
    const result = await supabaseAdmin
      .from("entity")
      .select()
      .eq("owner_uid", this.ownerUID)
      .eq("id", id)
      .single();

    if (result.error) throw result.error;

    const { data } = result;

    const entity: Entity = {
      name: data.name,
      createdAt: new Date(data.created_at),
      description: data.description,
      id: data.id,
      isDeleted: data.is_deleted,
      ownerId: data.owner_id,
      ownerUID: data.owner_uid,
    };

    return entity;
  }

  async getEntities(): Promise<Entity[]> {
    const result = await supabaseAdmin
      .from("entity")
      .select()
      .eq("owner_uid", this.ownerUID);

    if (result.error) throw result.error;

    const { data } = result;
    return data.map((item) => {
      const entity: Entity = {
        name: item.name,
        createdAt: new Date(item.created_at),
        description: item.description,
        id: item.id,
        isDeleted: item.is_deleted,
        ownerId: item.owner_id,
        ownerUID: item.owner_uid,
      };

      return entity;
    });
  }

  async getEntityActions(entityId: number): Promise<EntityAction[]> {
    const result = await supabaseAdmin
      .from("entity_action")
      .select(`
        *,
        entity!inner(owner_uid, owner_uid)
      `)
      .eq("is_deleted", false)
      .eq("entity.id", entityId)
      .eq("entity.owner_uid", this.ownerUID);

    if (result.error) throw result.error;

    const { data } = result;

    return data.map((item) => {
      const entityAction: EntityAction = {
        createdAt: new Date(item.created_at),
        description: item.description,
        entityId: item.entity.id,
        id: item.id,
        isDeleted: item.is_deleted,
        name:item.name,
        ownerId: item.entity.owner_id,
        timeIntervalMinutes: item.time_interval_minutes,
        nextAt: new Date(item.next_at),
        ownerUID: item.owner_uid
      };

      return entityAction;
    });
  }

}