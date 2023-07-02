import { Entity, EntityAction, EntityActionCreate, EntityCreate } from '@/models/entity.model';
import { getSupabaseClient } from '../utils/supabase';
import { useAuth } from './auth.hooks';

export const useEntities = () => {

  const { getCurrentRemarcUser } = useAuth();

  const getEntities = async (): Promise<Entity[]> => {
    const supabase = getSupabaseClient();
    const { uid } = (await getCurrentRemarcUser())!;
    const result = await supabase
      .from("entity")
      .select()
      .eq("owner_uid", uid)
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
        ownerUID: item.owner_uid
      };

      return entity;
    });
  }

  const getEntitiesActions = async (): Promise<EntityAction[]> => {
    const supabase = getSupabaseClient();
    const { uid } = (await getCurrentRemarcUser())!;
    const result = await supabase
      .from("entity_action")
      .select(`
        *,
        entity!inner(owner_uid, owner_uid)
      `)
      .eq("entity.owner_uid", uid);

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
        nextAt: item.next_at,
        ownerUID: uid,
      };

      return entityAction;
    });
  }

  const createEntity = async (entityCr: EntityCreate): Promise<any> => {
    const supabase = getSupabaseClient();
    const { uid, id } = (await getCurrentRemarcUser())!;
    const data = {
      name: entityCr.name,
      description: entityCr.description,
      owner_id: id,
      owner_uid: uid,
    };
    const result = await supabase.from("entity").insert(data);

    if (result.error) throw result.error;

    return true;
  }

  const createEntityAction = async (actionCr: EntityActionCreate): Promise<EntityAction> => {
    const supabase = getSupabaseClient();
    const { uid } = (await getCurrentRemarcUser())!;
    
    const result = await supabase
      .from("entity_action")
      .insert({
        name: actionCr.name,
        description: actionCr.description,
        entity_id: actionCr.entityId,
        time_interval_minutes: actionCr.timeIntervalMinutes,
        next_at: actionCr.nextAt,
        owner_uid: uid,
      })
      .select(`
        *,
        entity!inner(owner_id, id)
      `)
      .single();

    if (result.error) throw result.error;
    
    return {
      createdAt: new Date(result.data.created_at),
      description: result.data.description,
      entityId: result.data.entity.id,
      id: result.data.id,
      isDeleted: result.data.is_deleted,
      name:result.data.name,
      ownerId: result.data.entity.owner_id,
      timeIntervalMinutes: result.data.time_interval_minutes,
      nextAt: new Date(result.data.starts_at),
      ownerUID: uid,
    };
  }

  const deleteAction = (actionId: number) => updateEntityAction(actionId, { isDeleted: true });

  const updateEntityAction = async (actionId: number, partialAction: Partial<EntityAction>): Promise<any> => {
    const supabase = getSupabaseClient();

    const updateData: any = {};
    if (partialAction.name) updateData.name = partialAction.name;
    if (partialAction.description) updateData.description = partialAction.description;
    if (partialAction.timeIntervalMinutes) updateData.time_interval_minutes = partialAction.timeIntervalMinutes;
    if (partialAction.nextAt) updateData.next_at = partialAction.nextAt;
    if (partialAction.isDeleted === true) updateData.is_deleted = true;
    
    const result = await supabase
      .from("entity_action")
      .update(updateData)
      .eq("id", actionId);

    if (result.error) throw result.error;

    return true;
  }

  return {
    getEntities,
    getEntitiesActions,
    createEntity,
    createEntityAction,
    updateEntityAction,
    deleteAction,
  }
}