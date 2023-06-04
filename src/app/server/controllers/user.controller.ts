import { RemarcUserCreate } from '@/models/user.models';
import { AuthResponse, User } from '@supabase/supabase-js';
import { supabaseAdmin } from '../db/supabase';

export class UserController {
  

  getUserSession = async (
    refreshToken: string, 
    accessToken: string
  ): Promise<AuthResponse | null> => {
    const session = await supabaseAdmin.auth.setSession({
      refresh_token: refreshToken,
      access_token: accessToken,
    });

    if (session.error) return null;
    return session;
  }

  async registerUser(userCr: RemarcUserCreate, password: string): Promise<any> {
    const { data: usersWithEmail, error: usersWithEmailError } = await supabaseAdmin
      .from("remarc_user")
      .select()
      .eq("email", userCr.email);

    console.log("USERS", usersWithEmail)
    if (usersWithEmailError) throw usersWithEmailError;

    if (usersWithEmail.length) throw "User already exists";
    
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email: userCr.email,
      password,
      email_confirm: true,
      user_metadata: {
        name: userCr.name,
      }
    });

    if (error) throw error;

    return null;
  }


}