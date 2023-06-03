import { Entity, EntityAction, EntityActionCreate, EntityCreate } from "@/models/entity.model";
import { supabaseAdmin } from '../db/supabase';

export class EntityController {

  async getEntity(id: number): Promise<Entity | undefined> {
    const result = await supabaseAdmin
      .from("entity")
      .select()
      .eq("owner_id", 1)
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
    };

    return entity;
  }

  async getEntities(): Promise<Entity[]> {
    const result = await supabaseAdmin
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

  async getEntityActions(entityId: number): Promise<EntityAction[]> {
    const result = await supabaseAdmin
      .from("entity_action")
      .select(`
        *,
        entity!inner(owner_id, id)
      `)
      .eq("is_deleted", false)
      .eq("entity.id", entityId)
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
        startsAt: new Date(item.starts_at),
      };

      return entityAction;
    });
  }

  async createEntity(entityCr: EntityCreate): Promise<any> {
    const data = {
      name: entityCr.name,
      description: entityCr.description,
      owner_id: 1,
    };
    const result = await supabaseAdmin.from("entity").insert(data);

    if (result.error) throw result.error;

    return true;
  }

  async createEntityAction(entityId: string, actionCr: EntityActionCreate): Promise<any> {
    
  }

}