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

    // Session Management Logic
    useEffect(() => {
        if (!user || loading) return;

        let sessionInterval: any;
        let mounted = true;

        const checkSession = async () => {
            // Generate or retrieve session token from localStorage
            let currentSessionToken = localStorage.getItem('sessionToken');
            if (!currentSessionToken) {
                if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                    currentSessionToken = crypto.randomUUID();
                } else {
                    currentSessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
                }
                localStorage.setItem('sessionToken', currentSessionToken);
            }

            // Get IP address (best effort)
            let ipAddress = 'Unknown';
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                if (response.ok) {
                    const data = await response.json();
                    ipAddress = data.ip;
                }
            } catch (e) {
                console.warn('Could not fetch IP address', e);
            }

            if (!mounted) return;

            // Register session in DB
            const { error } = await supabase
                .from('user_sessions')
                .upsert({
                    user_id: user.id,
                    session_token: currentSessionToken,
                    ip_address: ipAddress, // Note: This might be 'Unknown' if fetch fails
                    user_agent: navigator.userAgent,
                    last_seen: new Date().toISOString()
                }, { onConflict: 'user_id' }); // user_id is PK, so this enforces one session per user

            if (error) console.error('Error registering session:', error);

            // Periodic check for session validity (every 1 minute)
            sessionInterval = setInterval(async () => {
                if (!mounted) return;

                const { data, error } = await supabase
                    .from('user_sessions')
                    .select('session_token')
                    .eq('user_id', user.id)
                    .single();

                // If the session token in DB is different from ours, someone else logged in
                if (data && data.session_token !== currentSessionToken) {
                    await signOut();
                    alert('Se ha iniciado sesión en otro dispositivo. Tu sesión actual se ha cerrado por seguridad.');
                }
            }, 60000); // Check every minute
        };

        checkSession();

        return () => {
            mounted = false;
            if (sessionInterval) clearInterval(sessionInterval);
        };
    }, [user, loading]);

    // Inactivity Timeout Logic (30 minutes)
    useEffect(() => {
        if (!user) return;

        let inactivityTimer: any;

        const handleTimeout = async () => {
            await signOut();
            alert('Tu sesión ha expirado por inactividad (30 min).');
        };

        const resetTimer = () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(handleTimeout, 30 * 60 * 1000); // 30 minutes
        };

        // Events to track activity
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetTimer();
        };

        events.forEach(event => document.addEventListener(event, handleActivity));
        resetTimer(); // Initialize timer

        return () => {
            if (inactivityTimer) clearTimeout(inactivityTimer);
            events.forEach(event => document.removeEventListener(event, handleActivity));
        };
    }, [user]);

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
