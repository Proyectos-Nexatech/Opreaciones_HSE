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
            console.log('Fetching profile for:', userId);

            // Create a timeout promise
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile fetch timeout')), 7000)
            );

            // Execute query with race against timeout
            const queryPromise = supabase
                .from('user_profiles')
                .select('*, role:role_name(*)')
                .eq('id', userId)
                .single();

            const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

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
                console.log('Profile loaded successfully');
            }
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            // Don't clear profile if it was already set, unless it's a critical error
            // But here we probably want to fail gracefuly
            if (!profile) setProfile(null);
        }
    };

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading (Global UI safety)
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth loading timed out (global), forcing completion');
                setLoading(false);
            }
        }, 12000);

        const initializeAuth = async () => {
            try {
                // 1. Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    throw error;
                }

                if (mounted) {
                    if (session?.user) {
                        setSession(session);
                        setUser(session.user);
                        // Await profile fetch
                        await fetchProfile(session.user.id);
                    } else {
                        setSession(null);
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            console.log('Auth state change:', event);

            // Ignore INITIAL_SESSION as we handle initial load manually
            if (event === 'INITIAL_SESSION') {
                return;
            }

            setSession(session);
            setUser(session?.user ?? null);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    // Only fetch if we update the user or don't have a profile yet
                    await fetchProfile(session.user.id);
                }
            } else if (event === 'SIGNED_OUT') {
                setProfile(null);
                setSession(null);
                setUser(null);
            }

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
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            // Always clear local state to prevent UI getting stuck
            setSession(null);
            setUser(null);
            setProfile(null);
            localStorage.removeItem('sessionToken');
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (user) await fetchProfile(user.id);
    };

    // Session Management Logic
    useEffect(() => {
        if (!user || loading) return;

        let mounted = true;
        let channel: any;

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

            // Subscribe to realtime changes
            channel = supabase
                .channel(`session-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'user_sessions',
                        filter: `user_id=eq.${user.id}`,
                    },
                    (payload) => {
                        console.log('Session change detected:', payload);
                        const newSession = payload.new as any;
                        if (newSession && newSession.session_token !== currentSessionToken) {
                            console.warn('Concurrent session detected via realtime. Signing out.');
                            signOut();
                        }
                    }
                )
                .subscribe();

            // Also do a one-time check to see if we are already invalid (e.g. if we just woke up)
            const { data } = await supabase
                .from('user_sessions')
                .select('session_token')
                .eq('user_id', user.id)
                .single();

            if (data && data.session_token !== currentSessionToken) {
                console.warn('Concurrent session detected via initial check. Signing out.');
                signOut();
            }
        };

        checkSession();

        return () => {
            mounted = false;
            if (channel) supabase.removeChannel(channel);
        };
    }, [user, loading]);

    // Inactivity Timeout Logic (30 minutes)
    useEffect(() => {
        if (!user) return;

        let inactivityTimer: any;

        const handleTimeout = async () => {
            await signOut();
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
