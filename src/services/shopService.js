import { supabase } from '../lib/supabase';

export async function getEcoRewards(category = null) {
  let query = supabase.from('eco_rewards_shop').select('*').eq('is_active', true).order('coin_cost');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function redeemReward({ userId, rewardId, coinCost, shippingAddress }) {
  // Fetch user balance
  const { data: user } = await supabase.from('users').select('prodcoins').eq('user_id', userId).single();
  if (!user || user.prodcoins < coinCost) throw new Error('Insufficient ProdCoins');

  // Atomic: deduct coins + insert redemption
  const { error: updateErr } = await supabase
    .from('users')
    .update({ prodcoins: user.prodcoins - coinCost })
    .eq('user_id', userId);
  if (updateErr) throw updateErr;

  const { data, error } = await supabase
    .from('redemptions')
    .insert({ user_id: userId, reward_id: rewardId, coins_spent: coinCost, shipping_address: shippingAddress })
    .select()
    .single();
  if (error) throw error;

  // Decrement stock if applicable
  await supabase.rpc('decrement_stock', { reward_id_arg: rewardId }).catch(() => {});

  return data;
}

export async function getUserRedemptions(userId) {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, reward:eco_rewards_shop(*)')
    .eq('user_id', userId)
    .order('redeemed_at', { ascending: false });
  if (error) throw error;
  return data;
}
