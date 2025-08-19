import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { Profile } from '../types';
import { TablesInsert } from '../integrations/supabase/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  signUp: (email: string, pass: string, fullName: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const getOrCreateProfile = async (user: User): Promise<Profile | null> => {
    // 1. Try to fetch profile
    const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
    
    if (fetchError) {
        console.error('Error fetching profile:', fetchError.message);
        return null;
    }
    
    if (profileData) {
        return profileData;
    }

    // 2. Profile not found, create it
    const newProfileData: TablesInsert<'profiles'> = {
        id: user.id,
        // The full_name provided during signup is in user_metadata
        full_name: user.user_metadata.full_name || null,
        role: 'user', // Set default role
    };

    const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([newProfileData])
        .select()
        .single();
    
    if (insertError) {
        console.error('Error creating profile:', insertError.message);
        return null;
    }
    
    return newProfile;
  }

  useEffect(() => {
    const getSessionAndProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            const profile = await getOrCreateProfile(currentUser);
            setProfile(profile);
        }
        setLoading(false);
    }
    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
            const profile = await getOrCreateProfile(currentUser);
            setProfile(profile);
        } else {
            setProfile(null);
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signUp = async (email: string, pass: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
            data: {
                full_name: fullName
            }
        }
    });
    if (error) throw error;
    return data;
  };

  const isAuthenticated = !!user;

  const value = {
    user,
    session,
    profile,
    isAuthenticated,
    login,
    logout,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};