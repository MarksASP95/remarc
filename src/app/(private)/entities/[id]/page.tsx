import { EntityController } from "@/app/server/controllers/entity.controller";
import EntityPanel from "./EntityForm/EntityPanel";
import { cookies } from "next/headers";
import { supabaseAdmin } from '../../../server/db/supabase';
import { AuthResponse } from "@supabase/supabase-js";

export const revalidate = 0;

export default async function EntityPage({
    params,
  }: {
    params: { id: string };
}) {

  const cookieStore = cookies();
  let refreshToken = "";
  let accessToken = "";
  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name === "my-refresh-token") return refreshToken = cookie.value;
    if (cookie.name === "my-access-token") return accessToken = cookie.value;
  })

  let session: AuthResponse | null = null;
  if (refreshToken && accessToken) {

    session = await supabaseAdmin.auth.setSession({ 
      refresh_token: refreshToken, 
      access_token: accessToken
     });
     
    // console.log("SESSION SET", session);
  } else {
    // make sure you handle this case!
    console.log("User not authenticated");
  }
  
  const entitiesCr = new EntityController(session!.data.user!.id);

  const [ entity, actions ] = await Promise.all([
    entitiesCr.getEntity(parseInt(params.id)),
    entitiesCr.getEntityActions(parseInt(params.id)),
  ]);

  if (!entity) return "Entity not found";

  return <EntityPanel entity={entity} actions={actions} />;
}