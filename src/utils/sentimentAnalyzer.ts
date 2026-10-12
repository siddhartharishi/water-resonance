import { SentimentType, SentimentAnalysisResult } from '../types';

// Negative lexicon: anger, hostility, degradation, depression, sorrow, anxiety, violence
const NEGATIVE_WORDS = new Set([
  // Anger & Hostility
  'hate', 'hates', 'hated', 'hating', 'hatred', 'hateful',
  'despise', 'despises', 'despised', 'despising',
  'detest', 'detests', 'detested', 'detesting',
  'loathe', 'loathes', 'loathed', 'loathing',
  'resent', 'resents', 'resented', 'resenting', 'resentment', 'resentful',
  'anger', 'angry', 'angrier', 'angriest', 'angrily',
  'mad', 'madder', 'maddest', 'madness',
  'furious', 'furiously', 'fury', 'enraged', 'rage', 'raging',
  'wrath', 'wrathful', 'spite', 'spiteful', 'bitter', 'bitterness',
  'grudge', 'vengeful', 'vengeance', 'malice', 'malicious',
  'vicious', 'hostile', 'hostility', 'pissed', 'offended',

  // Annoyance & Frustration
  'annoy', 'annoys', 'annoyed', 'annoying', 'annoyance',
  'irritate', 'irritates', 'irritated', 'irritating', 'irritation',
  'frustrate', 'frustrates', 'frustrated', 'frustrating', 'frustration',
  'bother', 'bothers', 'bothered', 'bothering',
  'sucks', 'sucked', 'sucking',

  // Degradation & Insults
  'stupid', 'dumb', 'idiot', 'idiotic', 'idiots',
  'fool', 'fools', 'foolish', 'moron', 'moronic',
  'loser', 'losers', 'worthless', 'useless', 'pathetic',
  'disgrace', 'disgraceful', 'shame', 'shameful',
  'disgust', 'disgusts', 'disgusted', 'disgusting',
  'sick', 'sickening', 'nauseating', 'repulsive', 'revolting', 'vile',
  'gross', 'nasty', 'foul', 'ugly', 'ugliness', 'hideous',
  'scum', 'trash', 'garbage', 'jerk', 'jerks', 'bastard', 'asshole', 'bitch',
  'pig', 'cur', 'monster', 'monstrous',

  // Profanity & Hostile Exclamations
  'fuck', 'fucking', 'fucked', 'fucker',
  'shit', 'shitty', 'damn', 'damned', 'hell',

  // Harm & Violence
  'kill', 'kills', 'killed', 'killing', 'killer', 'murder', 'murderer',
  'die', 'dies', 'died', 'dying', 'death', 'dead', 'deadly',
  'destroy', 'destroys', 'destroyed', 'destroying', 'destruction', 'destructive',
  'ruin', 'ruins', 'ruined', 'ruining',
  'shatter', 'shatters', 'shattered', 'shattering',
  'crush', 'crushes', 'crushed', 'crushing',
  'hurt', 'hurts', 'hurting', 'pain', 'painful', 'painfully',
  'suffer', 'suffers', 'suffered', 'suffering',
  'wound', 'wounds', 'wounded', 'bleed', 'bleeding', 'blood',
  'cruel', 'cruelty', 'brutal', 'brutality',
  'violence', 'violent', 'violently', 'war', 'warfare', 'fight', 'fighting',
  'attack', 'attacked', 'attacking', 'assault', 'strike',
  'abuse', 'abusive', 'torture', 'tortured', 'punish', 'punishment',
  'toxic', 'toxicity', 'poison', 'poisonous', 'venom', 'venomous',

  // Depression, Sorrow & Grief
  'sad', 'sadness', 'sadder', 'saddest', 'sadly',
  'sorrow', 'sorrowful', 'grief', 'grieving', 'mourn', 'mourning',
  'cry', 'crying', 'cried', 'cries', 'weep', 'weeping', 'tears',
  'depressed', 'depression', 'depressing', 'despair', 'despairing',
  'miserable', 'misery', 'agony', 'agonizing', 'anguish',
  'heartbreak', 'heartbroken', 'brokenhearted',
  'lonely', 'loneliness', 'alone', 'isolated', 'isolation',
  'hopeless', 'hopelessness', 'helpless', 'helplessness',
  'unhappy', 'unhappiness', 'gloomy', 'gloom', 'bleak',
  'dismal', 'pessimistic', 'regret', 'regrets', 'regretful',
  'guilt', 'guilty',

  // Anxiety, Stress & Fear
  'stress', 'stressed', 'stressful', 'distress', 'distressed',
  'anxious', 'anxiety', 'nervous', 'nervousness',
  'panic', 'panicked', 'panicking',
  'worry', 'worried', 'worries', 'worrying',
  'fear', 'fears', 'fearful', 'afraid', 'frightened',
  'terrified', 'terrifying', 'terror', 'scared', 'scary',
  'dread', 'dreading', 'dreadful',
  'horrible', 'horrific', 'horrifying', 'horror',
  'terrible', 'terribly', 'awful', 'awfully',
  'nightmare', 'disaster', 'disastrous', 'catastrophe', 'catastrophic',
  'chaos', 'chaotic', 'tension', 'tense', 'overwhelmed', 'overwhelming',
  'exhausted', 'burnout', 'burnt',

  // Deceit & Evil
  'lie', 'lies', 'lying', 'liar', 'liars',
  'fake', 'cheat', 'cheating', 'cheater',
  'corrupt', 'corruption', 'betray', 'betrayed', 'betrayal',
  'deceive', 'deceit', 'deceptive', 'fraud',
  'dishonest', 'evil', 'wicked', 'curse', 'cursed',
  'demon', 'demonic', 'devil', 'devilish', 'satan',
]);

// Multi-word negative phrases (checked as substrings)
const NEGATIVE_PHRASES = [
  'make me sick',
  'makes me sick',
  'you make me sick',
  'you disgust me',
  'i hate you',
  'i hate this',
  'i hate everything',
  'i hate myself',
  'i will kill you',
  'go to hell',
  'shut up',
  'leave me alone',
  'go away',
  'get lost',
  'waste of time',
  'waste of space',
  'no hope',
  'want to die',
  'kill myself',
  'falling apart',
  'can not take this',
  'cannot take this',
  "can't take this",
  'sick of this',
  'sick of you',
  'tired of this',
  'tired of you',
  'fed up',
  'screw you',
  'piss off',
];

// Positive lexicon: gratitude, love, peace, harmony, joy, light, blessing
const POSITIVE_WORDS = new Set([
  // Love & Gratitude
  'love', 'loves', 'loved', 'loving', 'beloved',
  'gratitude', 'grateful', 'gratefully',
  'thank', 'thanks', 'thankful', 'thankfully', 'thankfulness',
  'appreciate', 'appreciated', 'appreciating', 'appreciation', 'appreciative',
  'cherish', 'cherishes', 'cherished', 'cherishing',
  'adore', 'adores', 'adored', 'adoring',
  'affection', 'affectionate', 'devotion', 'devoted',
  'kind', 'kindness', 'kindly', 'tender', 'tenderness',
  'warmth', 'warm', 'heartfelt', 'reverence', 'respect',

  // Peace & Harmony
  'peace', 'peaceful', 'peacefully', 'peacefulness',
  'serene', 'serenity', 'serenely',
  'calm', 'calming', 'calmness', 'calmly',
  'tranquil', 'tranquility', 'tranquilly',
  'stillness', 'harmony', 'harmonious', 'harmoniously',
  'balance', 'balanced', 'balancing', 'equilibrium',
  'zen', 'quiet', 'rest', 'restful', 'ease',
  'grace', 'graceful', 'gracefully',
  'gentle', 'gentleness', 'gently',
  'soothe', 'soothing', 'soothed',
  'relax', 'relaxed', 'relaxing', 'relaxation',

  // Joy, Light & Vitality
  'joy', 'joyful', 'joyfully', 'joyous',
  'bliss', 'blissful', 'blissfully',
  'happy', 'happiness', 'happily',
  'delight', 'delighted', 'delightful',
  'cheer', 'cheerful', 'cheerfully',
  'radiant', 'radiance', 'radiantly',
  'luminous', 'shine', 'shining', 'bright', 'brightness', 'brightly',
  'light', 'sunshine', 'sunlight', 'glow', 'glowing', 'gleam', 'gleaming',
  'vital', 'vitality', 'alive', 'life',
  'pure', 'purity', 'purely', 'clean', 'cleansing',
  'crystal', 'crystalline', 'clear', 'clarity',
  'flow', 'flowing',

  // Beauty, Blessing & Healing
  'beautiful', 'beauty', 'beautifully',
  'exquisite', 'magnificent', 'splendid', 'gorgeous', 'lovely',
  'divine', 'sacred', 'holy',
  'bless', 'blessed', 'blessing', 'blessings',
  'heal', 'healing', 'healed', 'healer',
  'miracle', 'miracles', 'miraculous',
  'hope', 'hopeful', 'faith', 'trust',
  'forgive', 'forgiven', 'forgiving', 'forgiveness',
  'compassion', 'compassionate', 'mercy', 'merciful',
  'free', 'freedom',
  'bloom', 'blooming', 'blossom', 'thrive', 'thriving', 'flourish',
  'abundant', 'abundance',
]);

// Multi-word positive phrases
const POSITIVE_PHRASES = [
  'love and gratitude',
  'thank you',
  'thank you so much',
  'i love you',
  'love you',
  'peace and joy',
  'pure love',
  'divine grace',
  'radiant light',
  'so grateful',
  'filled with gratitude',
  'bless you',
  'bless this water',
  'sacred water',
  'healing light',
  'inner peace',
  'deep peace',
  'calm mind',
  'open heart',
  'all is well',
  'i am grateful',
  'i am thankful',
  'i am peaceful',
  'i am blessed',
];

// Negation markers that flip the polarity of subsequent words
const NEGATORS = new Set([
  'not', 'no', 'never', 'none',
  'dont', "don't", 'do not',
  'cant', "can't", 'cannot',
  'wont', "won't", 'will not',
  'isnt', "isn't", 'is not',
  'arent', "aren't", 'are not',
  'wasnt', "wasn't", 'was not',
  'werent', "weren't", 'were not',
  'lack', 'lacks', 'lacking',
  'without', 'neither', 'nor',
  'hardly', 'scarcely', 'barely',
  'stop', 'quit', 'cease',
]);

/**
 * Perform comprehensive, robust rule-based sentiment analysis for Dr. Masaru Emoto water experiments.
 * Accurately detects negations (e.g. "not happy", "no love" -> negative), multi-word phrases,
 * and classifies input into positive, neutral, or negative.
 */
export function analyzeSentimentRuleBased(rawInput: string): SentimentAnalysisResult {
  const input = rawInput.trim();
  const lower = input.toLowerCase();

  // Clean tokens (remove punctuation)
  const tokens = lower
    .replace(/[^a-z0-9'\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let negScore = 0;
  let posScore = 0;

  // 1. Check multi-word negative phrases
  for (const phrase of NEGATIVE_PHRASES) {
    if (lower.includes(phrase)) {
      negScore += 3.5;
    }
  }

  // 2. Check multi-word positive phrases
  for (const phrase of POSITIVE_PHRASES) {
    if (lower.includes(phrase)) {
      posScore += 3.0;
    }
  }

  // 3. Scan tokens with negation lookback (up to 3 words behind)
  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];

    // Check if preceded by a negator within 3 tokens
    let isNegated = false;
    for (let back = 1; back <= 3 && i - back >= 0; back++) {
      if (NEGATORS.has(tokens[i - back])) {
        isNegated = true;
        break;
      }
    }

    const isNegWord = NEGATIVE_WORDS.has(word);
    const isPosWord = POSITIVE_WORDS.has(word);

    if (isPosWord) {
      if (isNegated) {
        // e.g. "not happy", "no love", "without peace" -> counts as strong negative!
        negScore += 2.5;
      } else {
        posScore += 1.5;
      }
    } else if (isNegWord) {
      if (isNegated) {
        // e.g. "not angry", "no hate" -> neutralized / slight positive
        posScore += 0.8;
      } else {
        negScore += 2.0;
      }
    }
  }

  // Formatted display quote
  const quoteDisplay = input
    ? (input.startsWith('“') ? input : `“${input}”`)
    : '“Observing stillness in fluid balance.”';

  // Decision logic
  let sentiment: SentimentType = 'neutral';
  let coherence = 64;
  let sentimentScore = 0.05;

  if (negScore > posScore && negScore >= 1.5) {
    sentiment = 'negative';
    const intensity = Math.min(1.0, negScore / 6.0);
    sentimentScore = -0.7 - intensity * 0.28;
    coherence = Math.max(8, Math.round(26 - intensity * 18));
  } else if (posScore > negScore && posScore >= 1.2) {
    sentiment = 'positive';
    const intensity = Math.min(1.0, posScore / 6.0);
    sentimentScore = 0.78 + intensity * 0.2;
    coherence = Math.min(99, Math.round(86 + intensity * 12));
  } else {
    sentiment = 'neutral';
    sentimentScore = 0.05;
    coherence = 62;
  }

  // Generate appropriate Emoto crystallography readouts
  if (sentiment === 'positive') {
    // Pick tailored primary emotion
    let emotion = 'Gratitude & Love';
    if (lower.includes('peace') || lower.includes('calm') || lower.includes('serene')) {
      emotion = 'Inner Peace & Serenity';
    } else if (lower.includes('joy') || lower.includes('happy') || lower.includes('bliss')) {
      emotion = 'Joy & Radiant Vitality';
    } else if (lower.includes('heal') || lower.includes('health') || lower.includes('pure')) {
      emotion = 'Healing Light & Purity';
    }

    return {
      sentiment: 'positive',
      sentimentScore: Number(sentimentScore.toFixed(2)),
      coherence,
      header: 'Water Resonance',
      badgeLabel: 'Blue Snowflake Crystallization',
      badgeIcon: 'auto_awesome',
      frequency: '528 Hz • Solfeggio Miracles',
      hzValue: 528,
      field: 'SACRED BLUE SNOWFLAKE MATRIX',
      primaryEmotion: emotion,
      molecularInsight:
        'Your words create coherent acoustic waves that weave water into an immaculate blue snowflake crystal with sacred six-fold geometry.',
      crystallineDescription:
        'A vibrant blue 6-arm snowflake crystal with luminous frosty dendritic branches and an inner diamond core.',
      quote: quoteDisplay,
    };
  }

  if (sentiment === 'negative') {
    // Tailor negative emotion
    let emotion = 'Discord & Agitation';
    if (lower.includes('hate') || lower.includes('anger') || lower.includes('mad') || lower.includes('fury') || lower.includes('pissed')) {
      emotion = 'Anger & Hostility';
    } else if (lower.includes('sad') || lower.includes('depress') || lower.includes('cry') || lower.includes('grief') || lower.includes('lonely')) {
      emotion = 'Grief & Heavy Sorrow';
    } else if (lower.includes('stress') || lower.includes('anxious') || lower.includes('panic') || lower.includes('fear') || lower.includes('scared')) {
      emotion = 'Anxiety & Tension';
    } else if (lower.includes('stupid') || lower.includes('fool') || lower.includes('idiot') || lower.includes('ugly') || lower.includes('disgust')) {
      emotion = 'Degradation & Resentment';
    }

    return {
      sentiment: 'negative',
      sentimentScore: Number(sentimentScore.toFixed(2)),
      coherence,
      header: 'Entropy Distortion',
      badgeLabel: 'Brown Asymmetric Distortion',
      badgeIcon: 'broken_image',
      frequency: '180 Hz • Heavy Agitation',
      hzValue: 180,
      field: 'DISCORDANT BROWN LATTICE',
      primaryEmotion: emotion,
      molecularInsight:
        'Harsh vibrational frequencies fracture the hydrogen bonding network into turbulent, distorted brown shards without symmetry.',
      crystallineDescription:
        'Murky brown asymmetrical distorted structures with jagged spikes, splintered shards, and broken bond bridges.',
      positiveAffirmationTransmutation:
        'I release agitation. Peace, clarity and loving presence flow through every droplet of my being.',
      quote: quoteDisplay,
    };
  }

  // Neutral Equilibrium
  return {
    sentiment: 'neutral',
    sentimentScore: Number(sentimentScore.toFixed(2)),
    coherence,
    header: 'Resting Equilibrium',
    badgeLabel: 'Light Blue Fluid Suspension',
    badgeIcon: 'bubble_chart',
    frequency: '432 Hz • Natural Baseline',
    hzValue: 432,
    field: 'DYNAMIC LIGHT BLUE H2O DRIFT',
    primaryEmotion: 'Stillness & Presence',
    molecularInsight:
      'Water responds with gentle fluid motion, waiting faithfully in light blue liquid equilibrium.',
    crystallineDescription:
      'Soft light blue spherical H2O molecular clusters gently undulating in balanced Brownian motion.',
    quote: quoteDisplay,
  };
}
