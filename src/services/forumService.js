import { supabase } from '../lib/supabase';

export async function getForumPosts(squadId, limit = 50) {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      *,
      author:users!forum_posts_author_user_id_fkey(user_id, username, role)
    `)
    .eq('squad_id', squadId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function createForumPost({ squadId, authorUserId, contentText, proofUrl = null, aiVerdict = 'no_image', aiConfidence = null, isCheckInLinked = false }) {
  const { data, error } = await supabase
    .from('forum_posts')
    .insert({
      squad_id: squadId,
      author_user_id: authorUserId,
      content_text: contentText,
      proof_url: proofUrl,
      ai_verdict: aiVerdict,
      ai_confidence: aiConfidence,
      is_check_in_linked: isCheckInLinked,
      reactions: {},
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function addReaction(postId, emoji) {
  // Read current reactions and increment
  const { data: post } = await supabase
    .from('forum_posts')
    .select('reactions')
    .eq('post_id', postId)
    .single();
  
  if (!post) return;
  const reactions = { ...(post.reactions || {}), [emoji]: ((post.reactions || {})[emoji] || 0) + 1 };
  
  const { error } = await supabase
    .from('forum_posts')
    .update({ reactions })
    .eq('post_id', postId);
  if (error) throw error;
}

export function subscribeToForumPosts(squadId, callback) {
  return supabase
    .channel(`forum:${squadId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'forum_posts',
      filter: `squad_id=eq.${squadId}`,
    }, callback)
    .subscribe();
}
