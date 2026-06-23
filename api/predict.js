export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { home, away, competition, stage } = req.body;

    // Validate input
    if (!home?.trim() || !away?.trim() || !competition || !stage) {
      return res.status(400).json({ error: 'Missing required fields: home, away, competition, stage' });
    }

    // Check for API key
    const apiKey = process.env.IBM_GRANITE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('API key not configured');
      return res.status(500).json({ error: 'Server not properly configured' });
    }

    const prompt = `You are an elite football analyst with deep knowledge of tactics, team form, and match psychology.

Analyse this upcoming match and predict the outcome with reasoning:

HOME TEAM: ${home.trim()}
AWAY TEAM: ${away.trim()}
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

    // Try IBM Granite first (if API key is IBM format)
    let response;
    let data;
    let responseText = '';

    try {
      // Attempt IBM Granite API call
      response = await fetch('https://api.us-south.watsonx.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model_id: 'ibm/granite-13b-chat-v2',
          input: prompt,
          parameters: {
            decoding_method: 'greedy',
            max_new_tokens: 1000,
            temperature: 0.7
          }
        })
      });

      data = await response.json();

      // Handle IBM Granite response
      if (data.results && data.results.length > 0) {
        responseText = data.results[0].generated_text;
      } else if (data.error) {
        throw new Error(`IBM Granite error: ${data.error.message || 'Unknown error'}`);
      }
    } catch (ibmError) {
      console.warn('IBM Granite failed, attempting Anthropic Claude fallback:', ibmError.message);

      // Fallback to Anthropic Claude if IBM fails
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      data = await response.json();

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${data.error?.message || 'Unknown error'}`);
      }

      if (data.content && data.content.length > 0) {
        responseText = data.content.map(block => block.text || '').join('');
      }
    }

    if (!responseText) {
      return res.status(500).json({ error: 'No response from AI service' });
    }

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Could not extract JSON from response:', responseText.substring(0, 200));
      return res.status(500).json({ error: 'Invalid response format from AI service' });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Validate result structure
    const requiredFields = ['winner', 'home_win_probability', 'draw_probability', 'away_win_probability', 'confidence', 'predicted_score', 'key_factor', 'home_strength', 'away_strength', 'reasoning'];
    const missingFields = requiredFields.filter(field => !(field in result));

    if (missingFields.length > 0) {
      console.error('Missing fields in response:', missingFields);
      return res.status(500).json({ error: `Invalid response structure. Missing: ${missingFields.join(', ')}` });
    }

    // Validate probabilities sum to approximately 100
    const totalProb = result.home_win_probability + result.draw_probability + result.away_win_probability;
    if (Math.abs(totalProb - 100) > 5) {
      console.warn(`Probabilities don't sum to 100: ${totalProb}`);
      // Normalize probabilities
      const factor = 100 / totalProb;
      result.home_win_probability = Math.round(result.home_win_probability * factor);
      result.draw_probability = Math.round(result.draw_probability * factor);
      result.away_win_probability = Math.round(result.away_win_probability * factor);
    }

    res.status(200).json(result);

  } catch (err) {
    console.error('Prediction error:', err);

    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Invalid JSON response from AI service' });
    }

    res.status(500).json({ 
      error: err.message || 'Failed to generate prediction. Please try again.'
    });
  }
}
