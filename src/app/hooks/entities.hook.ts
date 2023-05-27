import { Entity, EntityAction, EntityActionCreate, EntityCreate } from '@/models/entity.model';
import { getSupabaseClient } from '../utils/supabase';

export const useEntities = () => {

  const getEntities = async (): Promise<Entity[]> => {
    const supabase = getSupabaseClient();
    const result = await supabase
      .from("entity")
      .select()
      .eq("owner_id", 1)
      .eq("is_deleted", false);

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

  const getEntitiesActions = async (): Promise<EntityAction[]> => {
    const supabase = getSupabaseClient();
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

  const createEntity = async (entityCr: EntityCreate): Promise<any> => {
    const supabase = getSupabaseClient();
    const data = {
      name: entityCr.name,
      description: entityCr.description,
      owner_id: 1,
    };
    const result = await supabase.from("entity").insert(data);

    if (result.error) throw result.error;

    return true;
  }

  const createEntityAction = async (entityId: string, actionCr: EntityActionCreate): Promise<any> => {
    
  }

  return {
    getEntities,
    getEntitiesActions,
    createEntity,
    createEntityAction,
  }
}