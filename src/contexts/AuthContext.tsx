import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../config/supabase';

interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  full_name: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await authService.getCurrentUser();
          if (profile) {
            setUser({
              id: profile.id,
              username: profile.username,
              role: profile.role,
              full_name: profile.full_name
            });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await authService.getCurrentUser();
          if (profile) {
            setUser({
              id: profile.id,
              username: profile.username,
              role: profile.role,
              full_name: profile.full_name
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await authService.login(username, password);

      if (response.status === 'success' && response.data) {
        const userData: User = {
          id: response.data.id,
          username: response.data.username,
          role: response.data.role,
          full_name: response.data.full_name
        };

        setUser(userData);
        setIsLoading(false);
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }

    setIsLoading(false);
    return false;
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};