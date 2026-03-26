import { supabase } from '../lib/supabase';

export async function getUserGoals(userId) {
  const { data, error } = await supabase
    .from('individual_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createGoal({ userId, title, description, conservationCategory, targetDays }) {
  // Max 3 active goals
  const { count } = await supabase
    .from('individual_goals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', false);
  if ((count || 0) >= 3) throw new Error('Max 3 active goals allowed');

  const { data, error } = await supabase
    .from('individual_goals')
    .insert({
      user_id: userId,
      title,
      description,
      conservation_category: conservationCategory,
      target_days: targetDays,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(goalId) {
  const { error } = await supabase.from('individual_goals').delete().eq('goal_id', goalId);
  if (error) throw error;
}
