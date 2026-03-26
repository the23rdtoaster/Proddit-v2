import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { upsertUser, getUserProfile } from '../services/userService';
import { getSquadForUser, getSquadMembers } from '../services/squadService';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);           // Full Supabase `users` row
  const [squad, setSquad] = useState(null);         // Supabase `squads` row
  const [members, setMembers] = useState([]);       // Array of users in squad
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);// True after onboarding complete

  // Derived from user row
  const prodcoins = user?.prodcoins ?? 0;

  const loadUserData = useCallback(async (authUser) => {
    try {
      let profile = await getUserProfile(authUser.id);
      if (!profile) {
        // First-time login: create a stub user row
        profile = await upsertUser(authUser);
      }
      setUser(profile);
      setOnboarded(!!profile.persona); // Onboarding complete if persona is set

      // Load squad
      if (profile.user_id) {
        const sq = await getSquadForUser(profile.user_id);
        setSquad(sq);
        if (sq) {
          const mems = await getSquadMembers(sq.squad_id);
          setMembers(mems);
        }
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Subscribe to Supabase auth state changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) loadUserData(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) loadUserData(session.user);
      else { setUser(null); setSquad(null); setMembers([]); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  // Supabase Google OAuth login
  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSquad(null);
    setMembers([]);
    setOnboarded(false);
  };

  const refreshUser = async () => {
    if (!session?.user) return;
    const profile = await getUserProfile(session.user.id);
    setUser(profile);
    return profile;
  };

  const refreshSquad = async () => {
    if (!user) return;
    const sq = await getSquadForUser(user.user_id);
    setSquad(sq);
    if (sq) {
      const mems = await getSquadMembers(sq.squad_id);
      setMembers(mems);
    }
    return sq;
  };

  const spendCoins = (amt) => setUser(u => u ? { ...u, prodcoins: u.prodcoins - amt } : u);

  const value = {
    session,
    user,
    squad,
    members,
    prodcoins,
    loading,
    onboarded,
    authed: !!session,
    login,
    logout,
    refreshUser,
    refreshSquad,
    setUser,
    setSquad,
    setMembers,
    spendCoins,
    setOnboarded,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
