import { supabase } from '../lib/supabase';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Upload proof photo to Supabase Storage.
 * Returns the public URL.
 */
export async function uploadProofPhoto(file, userId) {
  const ext = file.name.split('.').pop();
  const date = new Date().toISOString().slice(0, 10);
  const uuid = crypto.randomUUID();
  const path = `proofs/${userId}/${date}/${uuid}.${ext}`;

  const { error } = await supabase.storage
    .from('proofs')
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('proofs').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Call Gemini Flash Vision to verify a conservation proof image.
 * Returns { verdict, confidence, reason }
 */
export async function callGeminiVision(imageUrl, userTaskDescription) {
  const prompt = `You are an AI verifier for a conservation habit app called Proddit.
A user has submitted an image as proof of a conservation action. Their stated daily commitment is: "${userTaskDescription || 'a conservation action'}".

Analyze the image and determine if it genuinely shows a conservation-related action.
Respond ONLY with a JSON object in this exact format:
{
  "verdict": "pass" | "fail" | "borderline",
  "confidence": <float 0.0-1.0>,
  "reason": "<one sentence explanation>"
}

Rules:
- "pass" if confidence >= 0.65 and image clearly shows a conservation action
- "borderline" if confidence is 0.4-0.65 or image is ambiguous
- "fail" if image shows no conservation action or is clearly irrelevant`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: 'image/jpeg', data: await fileToBase64(imageUrl) } }
            ]
          }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 200 }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`);
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('Gemini Vision error:', err);
    // Fallback: simulate a pass for demo
    return { verdict: 'borderline', confidence: 0.55, reason: 'Verification service unavailable — defaulting to borderline.' };
  }
}

async function fileToBase64(url) {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(blob);
  });
}

/**
 * Submit a check-in to Supabase.
 * Handles verdict → coins/XP → squad HP.
 */
export async function submitCheckIn({ userId, squadId, proofUrl, caption, shareToForum, verdict, confidence, category, taskDescription }) {
  const coinsEarned = verdict === 'pass' ? 50 : 0;
  const xpEarned = verdict === 'pass' ? 120 : 0;
  const date = new Date().toISOString().slice(0, 10);

  // Insert check-in record
  const { data: checkin, error } = await supabase
    .from('check_ins')
    .upsert({
      user_id: userId,
      squad_id: squadId,
      date,
      conservation_category: category,
      proof_url: proofUrl,
      ai_verdict: verdict,
      ai_confidence: confidence,
      final_verdict: verdict === 'borderline' ? null : verdict,
      coins_earned: coinsEarned,
      xp_earned: xpEarned,
    }, { onConflict: 'user_id,date' })
    .select()
    .single();

  if (error) throw error;

  // Update user XP, coins, streak, credit score
  const { data: user } = await supabase.from('users').select('*').eq('user_id', userId).single();
  if (user && verdict === 'pass') {
    const newStreak = (user.streak_count || 0) + 1;
    const streakBonus = [7, 30, 100].includes(newStreak) ? 50 : 0;
    await supabase.from('users').update({
      prodcoins: (user.prodcoins || 0) + coinsEarned,
      xp: (user.xp || 0) + xpEarned,
      level: Math.min(10, Math.floor(((user.xp || 0) + xpEarned) / 1000) + 1),
      streak_count: newStreak,
      credit_score: Math.min(1000, (user.credit_score || 500) + 15 + streakBonus),
    }).eq('user_id', userId);

    // Squad HP: +10 on pass
    await supabase.rpc('increment_squad_hp', { squad_id_arg: squadId, delta: 10 }).catch(() => {
      // Fallback if RPC not available
    });
  } else if (verdict === 'fail' && user) {
    await supabase.from('users').update({
      credit_score: Math.max(0, (user.credit_score || 500) - 12),
    }).eq('user_id', userId);
  }

  // Auto-post to forum if share enabled and pass/borderline
  if (shareToForum && (verdict === 'pass' || verdict === 'borderline')) {
    await supabase.from('forum_posts').insert({
      squad_id: squadId,
      author_user_id: userId,
      content_text: caption || 'Logged my daily conservation action! 🌱',
      proof_url: proofUrl,
      ai_verdict: verdict,
      ai_confidence: confidence,
      is_check_in_linked: true,
      reactions: {},
    });
  }

  return { checkin, coinsEarned, xpEarned };
}

export async function getTodayCheckIn(userId) {
  const date = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle();
  return data;
}
