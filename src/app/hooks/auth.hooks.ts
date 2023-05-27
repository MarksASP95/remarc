import { RemarcUser } from "@/models/user.models";
import { User } from "@supabase/supabase-js";
import { getSupabaseClient } from '../utils/supabase';

export const useAuth = () => {
  
  const supabase = getSupabaseClient();

  const signIn = async (email: string, password: string): Promise<User | null> => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (result.error) throw result.error;

    return result.data?.user || null;
  }

  const getAuthUser = async (): Promise<User | null> => {
    const result = await supabase.auth.getSession();

    if (result.error) throw result.error;

    return result.data.session?.user || null;
  }

  const getCurrentRemarcUser = async (): Promise<RemarcUser | null> => {
    return getAuthUser()
      .then((user) => {
        if (!user) return null;
        return supabase.from("remarc_user").select().eq("uid", user.id)
          .then(({ error, data }) => {
            if (error) throw error;
            if (!data) return null;

            const dbUser = data[0];
            const remarcUser: RemarcUser = {
              createdAt: new Date(dbUser.created_at),
              email: dbUser.email,
              id: dbUser.id,
              isDeleted: dbUser.is_deleted,
              name: dbUser.name,
              uid: dbUser.uid,
            };

            return remarcUser;
          });
      });
  }

  return {
    signIn,
    getAuthUser,
    getCurrentRemarcUser,
  }
}