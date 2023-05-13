import { EntityController } from "../controllers/entity.controller";
import { supabase } from "../db/supabase";
import "./entities.page.scss";

export default async function EntitiesPage() {

  const entityC = new EntityController();

  const actions = await entityC.getEntitiesActions();

  console.log("ACTIONS ARE", actions)

  return (
    <p>Entities page</p>
  );
}