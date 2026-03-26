import { supabase } from '../lib/supabase';

export async function getUserItems(userId) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('owner_user_id', userId)
    .eq('used', false)
    .order('acquired_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function useItem(itemId, userId) {
  const { data, error } = await supabase
    .from('items')
    .update({ used: true })
    .eq('item_id', itemId)
    .eq('owner_user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Give a user a random item drop after a successful check-in (20% chance)
export async function grantItemDrop(userId) {
  const itemTypes = ['shield', 'hp_potion', 'streak_freeze'];
  const rarities = { shield: 'common', hp_potion: 'common', streak_freeze: 'rare' };
  const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

  const { data, error } = await supabase
    .from('items')
    .insert({
      owner_user_id: userId,
      item_type: randomType,
      rarity: rarities[randomType],
      decay_value: 1.0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
