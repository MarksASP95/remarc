import { EntityController } from "@/app/server/controllers/entity.controller";
import EntityPanel from "./EntityForm/EntityPanel";

export const revalidate = 0;

export default async function EntityPage({
    params,
  }: {
    params: { id: string };
}) {
  
  const entitiesCr = new EntityController();

  const [ entity, actions ] = await Promise.all([
    entitiesCr.getEntity(parseInt(params.id)),
    entitiesCr.getEntityActions(parseInt(params.id)),
  ]);

  if (!entity) return "Entity not found";

  return <EntityPanel entity={entity} actions={actions} />;
}