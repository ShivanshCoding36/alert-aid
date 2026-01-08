/**
 * NLP Service for Alert Summarization and Sentiment Analysis
 * Natural Language Processing for disaster-related text content
 */

export interface AlertSummary {
  originalText: string;
  summary: string;
  keyPoints: string[];
  sentiment: {
    score: number; // -1 to 1
    label: 'negative' | 'neutral' | 'positive';
    urgency: 'low' | 'medium' | 'high' | 'critical';
  };
  entities: {
    locations: string[];
    organizations: string[];
    disasters: string[];
    numbers: { value: string; context: string }[];
  };
  keywords: string[];
  readingTime: number; // seconds
  timestamp: Date;
}

export interface SocialMediaPost {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'news';
  content: string;
  author: string;
  timestamp: Date;
  engagement: { likes: number; shares: number; comments: number };
  location?: { lat: number; lon: number; name: string };
}

export interface AggregatedReport {
  totalPosts: number;
  timeRange: { start: Date; end: Date };
  summary: string;
  sentimentBreakdown: { negative: number; neutral: number; positive: number };
  topLocations: { name: string; count: number }[];
  topKeywords: { word: string; count: number }[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  credibilityScore: number;
  posts: SocialMediaPost[];
}

// Common disaster-related keywords and their weights
const DISASTER_KEYWORDS = {
  critical: ['emergency', 'evacuation', 'critical', 'urgent', 'death', 'fatal', 'catastrophic', 'destroyed', 'rescue', 'trapped'],
  high: ['warning', 'alert', 'danger', 'severe', 'damage', 'injured', 'flooding', 'earthquake', 'cyclone', 'tsunami', 'fire'],
  medium: ['caution', 'advisory', 'rising', 'heavy', 'storm', 'wind', 'rain', 'shelter', 'prepare', 'watch'],
  low: ['update', 'report', 'monitoring', 'forecast', 'expected', 'potential', 'minor', 'stable'],
};

// Sentiment words
const SENTIMENT_WORDS = {
  negative: ['disaster', 'death', 'damage', 'destroyed', 'injured', 'trapped', 'worst', 'terrible', 'devastating', 'crisis', 'emergency', 'victim', 'flood', 'earthquake', 'fire', 'storm'],
  positive: ['safe', 'rescued', 'survived', 'help', 'support', 'relief', 'recovery', 'aid', 'volunteers', 'donation', 'shelter', 'saved', 'improving', 'stable'],
  neutral: ['report', 'update', 'information', 'data', 'statistics', 'monitor', 'forecast', 'expected'],
};

// Location patterns
const LOCATION_PATTERNS = [
  /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
  /at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
  /near\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+district/gi,
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+area/gi,
];

// Number patterns
const NUMBER_PATTERNS = [
  { pattern: /(\d+(?:,\d{3})*)\s*(?:people|persons|individuals)/gi, context: 'affected people' },
  { pattern: /(\d+(?:,\d{3})*)\s*(?:dead|deaths|killed|casualties)/gi, context: 'casualties' },
  { pattern: /(\d+(?:,\d{3})*)\s*(?:injured|wounded)/gi, context: 'injuries' },
  { pattern: /(\d+(?:,\d{3})*)\s*(?:homes?|houses?|buildings?)/gi, context: 'structures' },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:mm|cm|m|inches?|feet?)/gi, context: 'measurement' },
  { pattern: /magnitude\s+(\d+(?:\.\d+)?)/gi, context: 'earthquake magnitude' },
  { pattern: /(\d+(?:\.\d+)?)\s*(?:km\/h|mph)/gi, context: 'wind speed' },
];

class NLPService {
  private static instance: NLPService;
  private stopWords: Set<string>;

  private constructor() {
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this',
      'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their', 'we',
      'our', 'you', 'your', 'he', 'she', 'him', 'her', 'his', 'as', 'if',
    ]);
  }

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  /**
   * Summarize an alert text into key points
   */
  public summarizeAlert(text: string): AlertSummary {
    const sentences = this.extractSentences(text);
    const sentiment = this.analyzeSentiment(text);
    const entities = this.extractEntities(text);
    const keywords = this.extractKeywords(text);
    const urgency = this.calculateUrgency(text, keywords);

    // Generate summary from most important sentences
    const rankedSentences = this.rankSentences(sentences, keywords);
    const summary = rankedSentences.slice(0, 2).join(' ');
    const keyPoints = rankedSentences.slice(0, 4);

    // Calculate reading time (average 200 words per minute)
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil((wordCount / 200) * 60);

    return {
      originalText: text,
      summary,
      keyPoints,
      sentiment: {
        score: sentiment.score,
        label: sentiment.label,
        urgency,
      },
      entities,
      keywords,
      readingTime,
      timestamp: new Date(),
    };
  }

  /**
   * Analyze sentiment of text
   */
  public analyzeSentiment(text: string): { score: number; label: 'negative' | 'neutral' | 'positive' } {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let matches = 0;

    for (const word of words) {
      if (SENTIMENT_WORDS.negative.includes(word)) {
        score -= 1;
        matches++;
      } else if (SENTIMENT_WORDS.positive.includes(word)) {
        score += 1;
        matches++;
      }
    }

    // Normalize score to -1 to 1 range
    const normalizedScore = matches > 0 ? score / matches : 0;

    let label: 'negative' | 'neutral' | 'positive';
    if (normalizedScore < -0.2) label = 'negative';
    else if (normalizedScore > 0.2) label = 'positive';
    else label = 'neutral';

    return { score: normalizedScore, label };
  }

  /**
   * Extract named entities from text
   */
  public extractEntities(text: string): AlertSummary['entities'] {
    const locations: Set<string> = new Set();
    const organizations: Set<string> = new Set();
    const disasters: Set<string> = new Set();
    const numbers: { value: string; context: string }[] = [];

    // Extract locations
    for (const pattern of LOCATION_PATTERNS) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        if (match[1] && match[1].length > 2) {
          locations.add(match[1].trim());
        }
      }
    }

    // Extract numbers with context
    for (const { pattern, context } of NUMBER_PATTERNS) {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      while ((match = regex.exec(text)) !== null) {
        numbers.push({ value: match[0], context });
      }
    }

    // Extract disaster types
    const disasterTypes = ['flood', 'earthquake', 'cyclone', 'hurricane', 'tornado', 'tsunami', 'wildfire', 'drought', 'landslide', 'storm'];
    const lowerText = text.toLowerCase();
    for (const disaster of disasterTypes) {
      if (lowerText.includes(disaster)) {
        disasters.add(disaster.charAt(0).toUpperCase() + disaster.slice(1));
      }
    }

    // Extract organization patterns
    const orgPatterns = [
      /(?:NDMA|FEMA|WHO|UN|UNICEF|Red Cross|NDRF|SDRF)/g,
      /(?:National|State|Local)\s+(?:Emergency|Disaster)\s+(?:Management|Response)/gi,
    ];
    for (const pattern of orgPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        organizations.add(match[0]);
      }
    }

    return {
      locations: Array.from(locations),
      organizations: Array.from(organizations),
      disasters: Array.from(disasters),
      numbers,
    };
  }

  /**
   * Extract keywords from text
   */
  public extractKeywords(text: string, maxKeywords: number = 10): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !this.stopWords.has(word));

    // Count word frequencies
    const frequency: Map<string, number> = new Map();
    for (const word of words) {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }

    // Boost disaster-related keywords
    for (const [level, keywords] of Object.entries(DISASTER_KEYWORDS)) {
      const boost = level === 'critical' ? 3 : level === 'high' ? 2 : level === 'medium' ? 1.5 : 1;
      for (const keyword of keywords) {
        if (frequency.has(keyword)) {
          frequency.set(keyword, frequency.get(keyword)! * boost);
        }
      }
    }

    // Sort by frequency and return top keywords
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word]) => word);
  }

  /**
   * Calculate urgency level based on content
   */
  public calculateUrgency(text: string, keywords: string[]): 'low' | 'medium' | 'high' | 'critical' {
    const lowerText = text.toLowerCase();
    const allKeywords = keywords.join(' ').toLowerCase();

    // Check for critical keywords
    for (const word of DISASTER_KEYWORDS.critical) {
      if (lowerText.includes(word) || allKeywords.includes(word)) {
        return 'critical';
      }
    }

    // Check for high urgency keywords
    let highCount = 0;
    for (const word of DISASTER_KEYWORDS.high) {
      if (lowerText.includes(word)) highCount++;
    }
    if (highCount >= 2) return 'high';

    // Check for medium urgency keywords
    let mediumCount = 0;
    for (const word of DISASTER_KEYWORDS.medium) {
      if (lowerText.includes(word)) mediumCount++;
    }
    if (mediumCount >= 2 || highCount >= 1) return 'medium';

    return 'low';
  }

  /**
   * Aggregate multiple social media posts into a single report
   */
  public aggregateSocialMediaPosts(posts: SocialMediaPost[]): AggregatedReport {
    if (posts.length === 0) {
      return {
        totalPosts: 0,
        timeRange: { start: new Date(), end: new Date() },
        summary: 'No posts to analyze',
        sentimentBreakdown: { negative: 0, neutral: 0, positive: 0 },
        topLocations: [],
        topKeywords: [],
        urgencyLevel: 'low',
        credibilityScore: 0,
        posts: [],
      };
    }

    // Combine all content
    const combinedContent = posts.map(p => p.content).join(' ');
    
    // Analyze sentiment breakdown
    const sentimentCounts = { negative: 0, neutral: 0, positive: 0 };
    let totalUrgency = 0;
    const urgencyMap = { low: 1, medium: 2, high: 3, critical: 4 };

    for (const post of posts) {
      const sentiment = this.analyzeSentiment(post.content);
      sentimentCounts[sentiment.label]++;
      
      const keywords = this.extractKeywords(post.content, 5);
      const urgency = this.calculateUrgency(post.content, keywords);
      totalUrgency += urgencyMap[urgency];
    }

    // Calculate aggregated urgency
    const avgUrgency = totalUrgency / posts.length;
    let urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
    if (avgUrgency >= 3.5) urgencyLevel = 'critical';
    else if (avgUrgency >= 2.5) urgencyLevel = 'high';
    else if (avgUrgency >= 1.5) urgencyLevel = 'medium';
    else urgencyLevel = 'low';

    // Extract and count locations
    const locationCounts: Map<string, number> = new Map();
    const allKeywords: Map<string, number> = new Map();

    for (const post of posts) {
      const entities = this.extractEntities(post.content);
      for (const loc of entities.locations) {
        locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
      }

      const keywords = this.extractKeywords(post.content, 10);
      for (const keyword of keywords) {
        allKeywords.set(keyword, (allKeywords.get(keyword) || 0) + 1);
      }
    }

    // Calculate credibility based on engagement and source diversity
    const platformDiversity = new Set(posts.map(p => p.platform)).size / 4;
    const avgEngagement = posts.reduce((sum, p) => 
      sum + p.engagement.likes + p.engagement.shares, 0) / posts.length;
    const credibilityScore = Math.min(1, (platformDiversity * 0.4) + (Math.min(avgEngagement, 1000) / 1000 * 0.6));

    // Generate summary
    const topKeywords = Array.from(allKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    const summary = this.generateAggregatedSummary(posts.length, topKeywords, urgencyLevel);

    // Sort posts by timestamp
    const sortedPosts = [...posts].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime());

    return {
      totalPosts: posts.length,
      timeRange: {
        start: sortedPosts[sortedPosts.length - 1].timestamp,
        end: sortedPosts[0].timestamp,
      },
      summary,
      sentimentBreakdown: sentimentCounts,
      topLocations: Array.from(locationCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count })),
      topKeywords: Array.from(allKeywords.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count })),
      urgencyLevel,
      credibilityScore: Math.round(credibilityScore * 100) / 100,
      posts: sortedPosts,
    };
  }

  private extractSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20);
  }

  private rankSentences(sentences: string[], keywords: string[]): string[] {
    const keywordSet = new Set(keywords.map(k => k.toLowerCase()));
    
    return sentences
      .map(sentence => {
        const words = sentence.toLowerCase().split(/\s+/);
        const score = words.filter(w => keywordSet.has(w)).length;
        return { sentence, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ sentence }) => sentence);
  }

  private generateAggregatedSummary(
    postCount: number, 
    keywords: string[], 
    urgency: string
  ): string {
    const urgencyText = {
      critical: 'Critical situation',
      high: 'High-priority alert',
      medium: 'Moderate concern',
      low: 'Routine update',
    }[urgency] || 'Update';

    return `${urgencyText}: Analysis of ${postCount} social media posts indicates activity related to ${keywords.slice(0, 3).join(', ')}. Community response is ${urgency === 'critical' || urgency === 'high' ? 'highly active' : 'moderate'}.`;
  }
}

export const nlpService = NLPService.getInstance();
export default nlpService;
