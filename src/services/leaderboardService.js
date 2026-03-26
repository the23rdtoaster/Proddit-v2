import { supabase } from '../lib/supabase';

export async function getLeaderboard(sortBy = 'credit_score', categoryFilter = null) {
  let query = supabase
    .from('users')
    .select('user_id, username, role, credit_score, streak_count, impact_trees_planted, impact_waste_kg, impact_events_attended, conservation_category');

  if (categoryFilter) query = query.eq('conservation_category', categoryFilter);
  
  // Compute impact_score client-side. Sort server-side by chosen field
  const validSorts = ['credit_score', 'streak_count'];
  const serverSort = validSorts.includes(sortBy) ? sortBy : 'credit_score';
  query = query.order(serverSort, { ascending: false }).limit(50);

  const { data, error } = await query;
  if (error) throw error;

  // Add impact_score and guardian badge
  return data.map(u => ({
    ...u,
    impact_score: (u.impact_trees_planted || 0) * 10 + (u.impact_waste_kg || 0) * 2 + (u.impact_events_attended || 0) * 25,
    guardian: (u.credit_score || 0) >= 850,
  })).sort((a, b) => {
    if (sortBy === 'impact_score') return b.impact_score - a.impact_score;
    return b[serverSort] - a[serverSort];
  });
}
