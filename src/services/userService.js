import { supabase } from '../lib/supabase';

/**
 * Upsert a user row from Supabase Auth session.
 * Maps auth.uid() to user_id; uses email for initial username.
 */
export async function upsertUser(authUser, extraFields = {}) {
  const defaultUsername = authUser.email.split('@')[0].replace(/[^a-z0-9_]/gi, '_').slice(0, 32);
  const payload = {
    user_id: authUser.id,
    email: authUser.email,
    username: defaultUsername,
    ...extraFields,
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'user_id', ignoreDuplicates: false })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId, fields) {
  const { data, error } = await supabase
    .from('users')
    .update(fields)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addUserCoinsAndXP(userId, coins, xp) {
  // Fetch current values then update
  const user = await getUserProfile(userId);
  const newCoins = (user.prodcoins || 0) + coins;
  const newXP = (user.xp || 0) + xp;
  // Level thresholds: every 1000 XP = 1 level, max 10
  const newLevel = Math.min(10, Math.floor(newXP / 1000) + 1);
  return updateUserProfile(userId, { prodcoins: newCoins, xp: newXP, level: newLevel });
}
