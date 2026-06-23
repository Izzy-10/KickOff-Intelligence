export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { home, away, competition, stage } = req.body;

    const prompt = `You are an elite football analyst with deep knowledge of tactics, team form, and match psychology.

Analyse this upcoming match and predict the outcome with reasoning:

HOME TEAM: ${home}
AWAY TEAM: ${away}
COMPETITION: ${competition}
STAGE: ${stage}

Respond ONLY with valid JSON in this exact format, no extra text, no markdown:
{
  "winner": "team name or DRAW",
  "home_win_probability": number between 0 and 100,
  "draw_probability": number between 0 and 100,
  "away_win_probability": number between 0 and 100,
  "confidence": "HIGH" or "MEDIUM" or "LOW",
  "predicted_score": "e.g. 2-1",
  "key_factor": "single most decisive factor in 6 words or less",
  "home_strength": "one short phrase",
  "away_strength": "one short phrase",
  "reasoning": "3-4 sentence tactical reasoning explaining why this outcome is likely. Be specific about playing styles, form, and match context."
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const raw = data.content.map(i => i.text || '').join('');
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
