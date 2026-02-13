import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: any | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*, role:role_name(*)')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                setProfile(null);
            } else {
                if (data.status === 'Inactivo') {
                    console.log('Usuario inactivo, cerrando sesión automático.');
                    await supabase.auth.signOut();
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    return;
                }
                setProfile(data);
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            setProfile(null);
        }
    };

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth loading timed out, forcing completion');
                setLoading(false);
            }
        }, 8000);

        const initializeAuth = async () => {
            try {
                // 1. Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    }
                }
            } catch (error) {
                console.error('Error initializing session:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(safetyTimeout);
                }
            }
        };

        initializeAuth();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('Auth state change:', event); // Debug log

            setSession(session);
            setUser(session?.user ?? null);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    await fetchProfile(session.user.id);
                }
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
                setSession(null);
                setUser(null);
            }

            // Ensure loading is false after any auth event processing
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    const value = {
        session,
        user,
        profile,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
