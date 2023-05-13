import { Entity, EntityAction } from "@/models/entity.model";
import { supabase } from '../db/supabase';

export class EntityController {

  async getEntities(): Promise<Entity[]> {
    const result = await supabase
      .from("entity")
      .select()
      .eq("owner_id", 1);

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
      };

      return entity;
    });
  }

  async getEntitiesActions(): Promise<EntityAction[]> {
    const result = await supabase
      .from("entity_action")
      .select(`
        *,
        entity!inner(owner_id, id)
      `)
      .eq("entity.owner_id", 1);

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
        startsAt: item.starts_at,
      };

      return entityAction;
    });
  }
}