import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { analyzeSentimentRuleBased } from './src/utils/sentimentAnalyzer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '25mb' }));

  // Setup Gemini client
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Masaru Emoto Sentiment & Molecular Crystallization Endpoint
  app.post('/api/analyze-sentiment', async (req, res) => {
    try {
      const { text, audio, mimeType } = req.body;
      const rawText = typeof text === 'string' ? text.trim() : '';

      if (!rawText && !audio) {
        return res.status(400).json({ error: 'Text prompt or audio is required' });
      }

      const input = rawText || '';

      // If Gemini client is available, run deep semantic & crystalline classification with timeout
      if (ai) {
        try {
          const contents: any[] = [];
          if (audio) {
            contents.push({
              inlineData: {
                mimeType: mimeType || 'audio/webm',
                data: audio,
              },
            });
            contents.push({
              text: `Listen to this spoken human speech or affirmation.
1. Transcribe the exact spoken words into the "quote" field. If audio is unclear or empty, provide a gentle affirmation like "I am present and peaceful".
2. Analyze the emotional vibration based on Dr. Masaru Emoto's water crystal consciousness experiments (where loving, thankful, harmonious thoughts form exquisite hexagonal crystals, and angry, resentful, discordant thoughts produce fractured, chaotic, muddy or distorted structures).
3. Categorize the emotional vibration as "positive", "neutral", or "negative" and provide crystalline resonance parameters in JSON format.`,
            });
          } else {
            contents.push({
              text: `Analyze the following spoken human speech/affirmation based on Dr. Masaru Emoto's water crystal consciousness experiments (where loving, thankful, harmonious thoughts form exquisite hexagonal crystals, and angry, resentful, discordant thoughts produce fractured, chaotic, muddy or distorted structures).

Spoken text: "${input}"

Transcribe the verbatim input into the "quote" field.
Categorize the emotional vibration and provide crystalline resonance parameters in JSON format.`,
            });
          }

          const geminiPromise = ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: {
              systemInstruction: `You are an expert on Dr. Masaru Emoto's water crystal experiments, cymatics, and acoustic resonance.
Evaluate the emotional sentiment of the user's spoken words or daily affirmations.
Classify sentiment strictly as "positive", "neutral", or "negative".
- "positive": Love, gratitude, compassion, peace, joy, healing, blessing, beauty, kindness, hope. The water forms an intricate BLUE SNOWFLAKE CRYSTAL with six-fold dendritic arms and crystalline frost sparkles.
- "neutral": Observational statements, stillness, balance, everyday inquiries, calm presence. The water forms a gentle LIGHT BLUE FLUID H2O molecular cluster suspension.
- "negative": Anger, hatred, resentment, fear, insult, hostility, stress, disgust, sadness, cruelty. The water shatters into a BROWN DISTORTED UGLY STRUCTURE with murky jagged cracks and broken asymmetric shards.

Calculate a coherence percentage:
- positive: 80% to 99%
- neutral: 50% to 75%
- negative: 5% to 35%

Assign an appropriate Solfeggio or acoustic frequency (e.g. 528 Hz for love/miracles, 432 Hz for natural balance, 639 Hz for relationship/connection, 852 Hz for intuition/spiritual order, 174 Hz or 180 Hz for dissonance/chaos).`,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  quote: {
                    type: Type.STRING,
                    description: 'Verbatim transcription of the spoken words or speech',
                  },
                  sentiment: {
                    type: Type.STRING,
                    description: '"positive", "neutral", or "negative"',
                  },
                  sentimentScore: {
                    type: Type.NUMBER,
                    description: 'Between -1.0 (most discordant) to 1.0 (most harmonic)',
                  },
                  coherence: {
                    type: Type.INTEGER,
                    description: 'Percentage from 5 to 99 representing molecular crystal symmetry',
                  },
                  header: {
                    type: Type.STRING,
                    description: 'Short headline, e.g. "Water Resonance", "Harmonic Radiance", "Resting Equilibrium", "Entropy Distortion"',
                  },
                  badgeLabel: {
                    type: Type.STRING,
                    description: 'Badge phrase, e.g. "Blue Snowflake Crystallization", "Light Blue Fluid Suspension", "Brown Asymmetric Distortion"',
                  },
                  badgeIcon: {
                    type: Type.STRING,
                    description: 'Material icon name like "auto_awesome", "bubble_chart", "broken_image"',
                  },
                  frequency: {
                    type: Type.STRING,
                    description: 'Frequency title, e.g. "528 Hz • Solfeggio Miracles"',
                  },
                  hzValue: {
                    type: Type.NUMBER,
                    description: 'Acoustic frequency in Hz, e.g. 528, 432, 174',
                  },
                  field: {
                    type: Type.STRING,
                    description: 'Lattice status, e.g. "Sacred Blue Snowflake Array", "Dynamic Light Blue H2O Drift", "Discordant Brown Lattice"',
                  },
                  primaryEmotion: {
                    type: Type.STRING,
                    description: 'Primary emotion identified, e.g. "Gratitude & Grace", "Equilibrium", "Dissonance & Frustration"',
                  },
                  molecularInsight: {
                    type: Type.STRING,
                    description: 'Poetic reflection (1-2 sentences) about how these words affect water crystallization',
                  },
                  crystallineDescription: {
                    type: Type.STRING,
                    description: 'Visual description of the resulting crystal or broken molecule',
                  },
                  positiveAffirmationTransmutation: {
                    type: Type.STRING,
                    description: 'A soothing positive counter-affirmation if the input was negative or distressed',
                  },
                },
                required: [
                  'sentiment',
                  'sentimentScore',
                  'coherence',
                  'header',
                  'badgeLabel',
                  'badgeIcon',
                  'frequency',
                  'hzValue',
                  'field',
                  'primaryEmotion',
                  'molecularInsight',
                  'crystallineDescription',
                  'quote',
                ],
              },
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 10000)
          );

          const response = await Promise.race([geminiPromise, timeoutPromise]);

          if (response.text) {
            const data = JSON.parse(response.text);
            return res.json(data);
          }
        } catch (geminiError) {
          console.warn('Gemini API call timed out or failed, using robust rule-based engine:', geminiError);
        }
      }

      // Rule-based classification for accurate Dr. Emoto crystallography
      if (input) {
        const result = analyzeSentimentRuleBased(input);
        return res.json(result);
      }

      // If only audio was provided and no text was transcribed
      return res.json({
        quote: '“Voice vibration captured without clear words.”',
        sentiment: 'neutral',
        sentimentScore: 0.0,
        coherence: 50,
        header: 'Resting Equilibrium',
        badgeLabel: 'Fluid Molecular Drift',
        badgeIcon: 'bubble_chart',
        frequency: '432 Hz • Natural Baseline',
        hzValue: 432,
        field: 'DYNAMIC LIGHT BLUE H2O DRIFT',
        primaryEmotion: 'Fluid Presence',
        molecularInsight: 'Acoustic waveform received in water. For detailed crystalline crystallization, speak clearly or type your words.',
        crystallineDescription: 'Soft light blue spherical H2O molecular clusters undulating in natural liquid balance.',
      });
    } catch (err) {
      console.error('Server error analyzing sentiment:', err);
      res.status(500).json({ error: 'Failed to analyze sentiment' });
    }
  });

  // Serve Vite middlewares in development or static build in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Water Resonance App listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
