export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { home, away, competition, stage } = req.body;

    const prompt = `You are an elite football analyst. Analyse this match and predict the outcome.

HOME TEAM: ${home}
AWAY TEAM: ${away}
COMPETITION: ${competition}
STAGE: ${stage}

Respond ONLY with valid JSON, no markdown:
{"winner":"team name or DRAW","home_win_probability":0,"draw_probability":0,"away_win_probability":0,"confidence":"HIGH","predicted_score":"2-1","key_factor":"short phrase","home_strength":"short phrase","away_strength":"short phrase","reasoning":"3-4 sentences"}`;

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
