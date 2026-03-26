const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Send a message to Gemini and get a response.
 * @param {Array} history - Array of {role, parts:[{text}]} conversation history
 * @param {string} userMessage - The latest user message
 * @param {Object} userContext - User profile data for system prompt
 */
export async function chatWithGemini(history, userMessage, userContext = {}) {
  const systemPrompt = `You are the Proddit AI Assistant — a friendly, knowledgeable eco-coach embedded in a conservation habit survival app.

User profile:
- Username: ${userContext.username || 'Earthkeeper'}
- Role: ${userContext.role || 'unknown'} (conservation hero class)
- Conservation focus: ${userContext.conservation_category || 'general'}
- Credit score: ${userContext.credit_score || 500}/1000
- Current streak: ${userContext.streak_count || 0} days
- Level: ${userContext.level || 1}
- ProdCoins: ${userContext.prodcoins || 0}
- Impact: ${userContext.impact_trees_planted || 0} trees planted, ${userContext.impact_waste_kg || 0}kg waste diverted, ${userContext.impact_events_attended || 0} events attended

You can help with: task planning for their focus area, explaining their score changes, squad advice, sustainability tips tailored to their category, and motivation.
Be concise, warm, and action-oriented. Use eco-themed language. Keep responses under 200 words unless asked for more.`;

  const contents = [
    // Include history
    ...history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        })
      }
    );

    if (!response.ok) throw new Error(`Gemini error ${response.status}`);
    const result = await response.json();
    return result.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not respond right now.';
  } catch (err) {
    console.error('Gemini chat error:', err);
    return '🌿 I\'m momentarily offline. Try asking again — I\'ll be back before you can say "compost"!';
  }
}
