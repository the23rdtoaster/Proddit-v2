import { supabase } from '../lib/supabase';

function generateGroupId() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function getSquadForUser(userId) {
  const { data, error } = await supabase
    .from('squad_members')
    .select('squad_id, squads(*)')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data?.squads || null;
}

export async function getSquadMembers(squadId) {
  const { data, error } = await supabase
    .from('squad_members')
    .select('user_id, joined_at, users(*)')
    .eq('squad_id', squadId);
  if (error) throw error;
  return data.map(m => ({ ...m.users, joined_at: m.joined_at }));
}

export async function createSquad({ name, conservation_focus, cause_label, creatorUserId }) {
  const group_id = generateGroupId();
  const { data: squad, error } = await supabase
    .from('squads')
    .insert({ name, conservation_focus, cause_label, group_id, member_count: 1 })
    .select()
    .single();
  if (error) throw error;

  const { error: memberErr } = await supabase
    .from('squad_members')
    .insert({ squad_id: squad.squad_id, user_id: creatorUserId });
  if (memberErr) throw memberErr;

  // Create weekly quest
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  await supabase.from('squad_quests').insert({
    squad_id: squad.squad_id,
    week_start: weekStart.toISOString().slice(0, 10),
    description: '35 combined check-ins this week',
    target_checkins: 35,
  });

  return squad;
}

export async function joinSquadByCode(groupId, userId) {
  const { data: squad, error } = await supabase
    .from('squads')
    .select('*')
    .eq('group_id', groupId.toUpperCase())
    .eq('status', 'active')
    .single();
  if (error || !squad) throw new Error('Squad not found or not active');
  if (squad.member_count >= 6) throw new Error('Squad is full (max 6 members)');

  const { error: memberErr } = await supabase
    .from('squad_members')
    .insert({ squad_id: squad.squad_id, user_id: userId });
  if (memberErr) throw memberErr;

  await supabase
    .from('squads')
    .update({ member_count: squad.member_count + 1 })
    .eq('squad_id', squad.squad_id);

  return squad;
}

export async function updateSquadHP(squadId, delta) {
  const { data: squad } = await supabase
    .from('squads')
    .select('squad_hp')
    .eq('squad_id', squadId)
    .single();
  const newHP = Math.max(0, Math.min(100, (squad?.squad_hp || 100) + delta));
  await supabase.from('squads').update({ squad_hp: newHP }).eq('squad_id', squadId);
  return newHP;
}

export async function getSquadQuest(squadId) {
  const { data } = await supabase
    .from('squad_quests')
    .select('*')
    .eq('squad_id', squadId)
    .order('week_start', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getAllActiveSquads() {
  const { data, error } = await supabase
    .from('squads')
    .select('*')
    .eq('status', 'active')
    .order('total_impact_score', { ascending: false });
  if (error) throw error;
  return data;
}
