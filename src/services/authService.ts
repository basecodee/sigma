import { supabase, UserProfile } from '../config/supabase';

export interface AuthResponse {
  status: 'success' | 'error';
  data?: {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    full_name: string | null;
  };
  message?: string;
}

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isEmail = emailPattern.test(username);

      if (isEmail) {
        return authService.loginWithEmail(username, password);
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, role, is_active')
        .eq('username', username)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError || !profile) {
        return {
          status: 'error',
          message: 'Username atau password salah'
        };
      }

      const email = `${username}@payment-dashboard.local`;

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError) {
        return {
          status: 'error',
          message: 'Username atau password salah'
        };
      }

      return {
        status: 'success',
        data: {
          id: profile.id,
          username: profile.username,
          email: email,
          role: profile.role,
          full_name: profile.full_name
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        status: 'error',
        message: 'Terjadi kesalahan saat login'
      };
    }
  },

  loginWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError) {
        return {
          status: 'error',
          message: 'Email atau password salah'
        };
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        return {
          status: 'error',
          message: 'Profil pengguna tidak ditemukan'
        };
      }

      return {
        status: 'success',
        data: {
          id: profile.id,
          username: profile.username,
          email: authData.user.email || email,
          role: profile.role,
          full_name: profile.full_name
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        status: 'error',
        message: 'Terjadi kesalahan saat login'
      };
    }
  },

  signUp: async (username: string, password: string, fullName?: string, role: 'admin' | 'user' = 'user'): Promise<AuthResponse> => {
    try {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingProfile) {
        return {
          status: 'error',
          message: 'Username sudah digunakan'
        };
      }

      const email = `${username}@payment-dashboard.local`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            full_name: fullName || null
          }
        }
      });

      if (authError) {
        return {
          status: 'error',
          message: authError.message
        };
      }

      if (!authData.user) {
        return {
          status: 'error',
          message: 'Gagal membuat akun'
        };
      }

      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          username: username,
          full_name: fullName || null,
          role: role,
          is_active: true
        });

      if (profileError) {
        return {
          status: 'error',
          message: 'Gagal membuat profil pengguna'
        };
      }

      return {
        status: 'success',
        data: {
          id: authData.user.id,
          username: username,
          email: email,
          role: role,
          full_name: fullName || null
        }
      };
    } catch (error) {
      console.error('Sign up error:', error);
      return {
        status: 'error',
        message: 'Terjadi kesalahan saat mendaftar'
      };
    }
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !profile) {
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  getUserProfile: async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error || !profile) {
        return null;
      }

      return profile;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }
};
