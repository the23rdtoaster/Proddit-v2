import { supabase } from '../lib/supabase';

export async function getActiveTrades(userId) {
  const { data, error } = await supabase
    .from('trades')
    .select(`
      *,
      initiator:users!trades_initiator_user_id_fkey(username, role),
      recipient:users!trades_recipient_user_id_fkey(username, role),
      offered_item:items!trades_offered_item_id_fkey(item_type, rarity),
      requested_item:items!trades_requested_item_id_fkey(item_type, rarity)
    `)
    .or(`initiator_user_id.eq.${userId},recipient_user_id.eq.${userId}`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTradeHistory(userId) {
  const { data, error } = await supabase
    .from('trades')
    .select(`
      *,
      initiator:users!trades_initiator_user_id_fkey(username),
      offered_item:items!trades_offered_item_id_fkey(item_type, rarity)
    `)
    .or(`initiator_user_id.eq.${userId},recipient_user_id.eq.${userId}`)
    .neq('status', 'pending')
    .order('resolved_at', { ascending: false })
    .limit(20);
  if (error) throw error;
  return data;
}

export async function createTrade({ initiatorId, recipientId, offeredItemId, offeredCoins, requestedItemId }) {
  const { data, error } = await supabase
    .from('trades')
    .insert({
      initiator_user_id: initiatorId,
      recipient_user_id: recipientId,
      offered_item_id: offeredItemId || null,
      offered_coins: offeredCoins || 0,
      requested_item_id: requestedItemId || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function respondToTrade(tradeId, action) {
  const { data, error } = await supabase
    .from('trades')
    .update({ status: action, resolved_at: new Date().toISOString() })
    .eq('trade_id', tradeId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
