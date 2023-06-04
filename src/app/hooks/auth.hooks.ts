import { RemarcUser } from "@/models/user.models";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from '../utils/supabase';

export const useAuth = () => {
  
  const supabase = getSupabaseClient();
  const router = useRouter();

  const signIn = async (email: string, password: string): Promise<User | null> => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (result.error) throw result.error;

    return result.data?.user || null;
  }

  const subscribeToAuthStateChanges = () => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // delete cookies on sign out
        const expires = new Date(0).toUTCString()
        document.cookie = `my-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`
        document.cookie = `my-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (!session) return;
        const maxAge = 100 * 365 * 24 * 60 * 60 // 100 years, never expires
        document.cookie = `my-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`
        document.cookie = `my-refresh-token=${session.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`
      }
    })
  }

  const signOut = () => {
    return supabase.auth.signOut()
      .then(() => {
        router.push("/login");
      });
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
    signOut,
    getAuthUser,
    getCurrentRemarcUser,
    subscribeToAuthStateChanges,
  }
}