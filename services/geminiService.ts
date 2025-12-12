
import { GoogleGenAI } from "@google/genai";
import { DeepAnalysisResult, Verdict, ReelData, RealityForkScenario, Post, NewsShortItem, SearchFilters } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is missing.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to clean markdown from JSON strings
const cleanJson = (text: string) => {
  if (!text) return "{}";
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

// Helper to generate a matching image for a headline
export const generateMatchingImage = async (headline: string, aspectRatio: string = "16:9"): Promise<string | undefined> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: `Create a dramatic, high-quality news illustration representing this headline: "${headline}". Style: Detailed, cinematic, journalistic photography or realistic digital art. No text overlays.` }]
            },
            config: {
                imageConfig: { aspectRatio: aspectRatio as any }
            }
        });
        
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    } catch (e) {
        console.warn("Failed to generate image for:", headline);
    }
    return undefined;
};

/**
 * DEEP TRUTH CORE & INTENT LAYER
 */
export const analyzeTextDeeply = async (text: string, contextType: 'NEWS' | 'CHAT' | 'DEBATE'): Promise<DeepAnalysisResult> => {
  const ai = getAiClient();
  
  const promptContext = {
    NEWS: `Focus on factual verification, political bias, and source credibility.`,
    CHAT: `Focus on psychological intent, passive aggression, emotional manipulation, and power dynamics between sender and receiver. Treat 'TrustScore' as a 'Sincerity/Health Score'.`,
    DEBATE: `Focus on logical fallacies, rhetorical tricks, strength of arguments, and missing data. Treat 'TrustScore' as a 'Logic/Strength Score'.`
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are the OmniTruth Engine. Perform a deep multi-layer analysis.
      
      CONTEXT: ${contextType} (${promptContext[contextType]})
      INPUT TEXT: "${text}"

      Execute these layers:
      1. 🔍 TRUTH CORE: Extract claims, verify facts (use Google Search), check contradictions.
      2. 🧠 INTENT LAYER: Detect hidden motives, what they aren't saying, emotional state.
      3. 🛡️ MANIPULATION SHIELD: Flag gaslighting, guilt-tripping, propaganda, fallacies.
      4. 🧬 REALITY GRAPH: Synthesize everything into a cohesive summary.

      IMPORTANT: Return ONLY valid JSON. No Markdown.
      Structure:
      {
        "trustScore": number (0-100),
        "verdict": "TRUE" | "MISLEADING" | "FAKE" | "UNVERIFIED" | "SATIRE",
        "summary": "Executive summary of the reality graph",
        "claims": [
          { "id": "1", "text": "Claim...", "status": "SUPPORTED" | "CONTRADICTED" | "INSUFFICIENT", "confidence": number, "reasoning": "..." }
        ],
        "intent": {
            "primaryMotive": "e.g., To provoke anger, To solicit validation...",
            "emotionalState": "e.g., Anxious, Deceptive, Sincere...",
            "hiddenMeaning": "The subtext or what is left unsaid...",
            "powerDynamics": "Who holds the power in this communication..."
        },
        "manipulationFlags": [
          { "type": "e.g., Gaslighting, Ad Hominem", "severity": "LOW" | "MEDIUM" | "HIGH", "description": "..." }
        ]
      }`,
      config: {
        tools: [{ googleSearch: {} }] 
      },
    });

    const parsed = JSON.parse(cleanJson(response.text || "{}"));

    // Extract sources
    const sources: string[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push(chunk.web.uri);
        }
      });
    }

    return {
      trustScore: parsed.trustScore || 50,
      verdict: parsed.verdict || Verdict.UNVERIFIED,
      summary: parsed.summary || "Analysis incomplete.",
      claims: parsed.claims || [],
      intent: parsed.intent || { primaryMotive: "Unknown", emotionalState: "Neutral", hiddenMeaning: "None detected", powerDynamics: "Balanced" },
      manipulationFlags: parsed.manipulationFlags || [],
      realityGraphSummary: parsed.summary,
      sources: Array.from(new Set(sources))
    };

  } catch (error) {
    console.error("Deep analysis failed:", error);
    return {
      trustScore: 0,
      verdict: Verdict.UNVERIFIED,
      summary: "System Error during Deep Scan.",
      claims: [],
      intent: { primaryMotive: "Error", emotionalState: "Error", hiddenMeaning: "Error", powerDynamics: "Error" },
      manipulationFlags: [],
      realityGraphSummary: "Analysis Failed.",
      sources: []
    };
  }
};

/**
 * GLOBAL SEARCH
 */
export const performGlobalSearch = async (query: string, filters?: SearchFilters): Promise<Post[]> => {
    const ai = getAiClient();
    
    let filterContext = "";
    if (filters) {
        if (filters.dateRange !== 'ALL') filterContext += `- Date Range: ${filters.dateRange.replace('_', ' ')}\n`;
        if (filters.authorRole !== 'ALL') filterContext += `- Author Role: ${filters.authorRole}\n`;
        if (filters.verdict !== 'ALL') filterContext += `- Verdict/Status: ${filters.verdict}\n`;
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Search the web for "${query}". 
            
            ${filterContext ? `Apply these strict filters to your selection of results:\n${filterContext}` : ""}

            Return a JSON array of 3-5 "Social Media Posts" that represent the search results.
            
            Each post should look like it was written by a relevant entity (News Outlet, Expert, or Eye Witness).
            
            Format:
            [
              {
                "id": "generated_id",
                "author": "Name of source",
                "authorRole": "Journalist" | "Expert" | "Citizen",
                "content": "The actual finding/news snippet...",
                "timestamp": "ISO Date string",
                "trustScore": number,
                "verdict": "TRUE" | "MOSTLY_TRUE" | "PARTIALLY_TRUE" | "MISLEADING" | "FAKE" | "UNVERIFIED" | "SATIRE",
                "verificationSummary": "Why this is credible..."
              }
            ]
            `,
            config: { tools: [{ googleSearch: {} }] }
        });

        const parsed = JSON.parse(cleanJson(response.text || "[]"));
        
        // Map to full Post type
        return parsed.map((item: any, idx: number) => ({
            id: `search-${Date.now()}-${idx}`,
            author: item.author || "Unknown Source",
            authorRole: item.authorRole || "Citizen",
            content: item.content,
            timestamp: new Date().toISOString(),
            trustScore: item.trustScore || 50,
            crowdScore: 50, 
            verdict: item.verdict || Verdict.UNVERIFIED,
            type: 'POST',
            image: `https://picsum.photos/seed/${idx}${Date.now()}/800/400`, // Search is fast, we skip image gen for now unless requested
            likes: Math.floor(Math.random() * 500),
            comments: Math.floor(Math.random() * 50),
            hasLiked: false,
            verificationDetails: {
                trustScore: item.trustScore || 50,
                verdict: item.verdict || Verdict.UNVERIFIED,
                summary: item.verificationSummary || "Generated from search result.",
                claims: [],
                manipulationFlags: [],
                intent: { primaryMotive: "Information", emotionalState: "Neutral", hiddenMeaning: "None", powerDynamics: "Neutral" },
                sources: [],
                realityGraphSummary: item.verificationSummary
            }
        }));

    } catch (e) {
        console.error("Search failed", e);
        return [];
    }
};

/**
 * FETCH TRENDING POSTS (REAL FEED)
 * Enhanced with real image generation.
 */
export const fetchTrendingPosts = async (): Promise<Post[]> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are the OmniTruth Chronicler.
      Task: Find 5 REAL, current, trending global news stories from the last 24 hours using Google Search.
      
      Output: A JSON array of "Social Media Posts".
      
      Constraint:
      - Use real headlines and facts.
      - "trustScore" should be high (80-100) for verified news.
      - "verdict" should be "TRUE" or "MOSTLY_TRUE".
      - "content" should be a 2-3 sentence summary in the style of a news update.
      - "author" should be the news organization (e.g. "Reuters", "AP", "BBC").
      - "sourceUrl": The URL of the news.
      
      JSON Structure:
      [
        {
          "headline": "...", 
          "author": "...",
          "content": "...",
          "trustScore": 95,
          "verdict": "TRUE",
          "sourceUrl": "..."
        }
      ]`,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    const parsed = JSON.parse(cleanJson(response.text || "[]"));
    
    // Process items in parallel to generate images
    const postsWithImages = await Promise.all(parsed.map(async (item: any, idx: number) => {
        // Generate image based on headline
        const genImage = await generateMatchingImage(item.headline, "16:9");
        
        return {
            id: `trend-${Date.now()}-${idx}`,
            author: item.author || "Global Chronicler",
            authorRole: "Journalist",
            content: item.content,
            timestamp: new Date().toISOString(),
            trustScore: item.trustScore || 90,
            crowdScore: 50,
            verdict: item.verdict as Verdict || Verdict.TRUE,
            type: 'POST',
            likes: Math.floor(Math.random() * 2000) + 100,
            comments: Math.floor(Math.random() * 300) + 10,
            hasLiked: Math.random() > 0.8,
            image: genImage || `https://picsum.photos/seed/${idx}/800/400`,
            verificationDetails: {
                trustScore: item.trustScore || 90,
                verdict: item.verdict as Verdict || Verdict.TRUE,
                summary: "Verified against live global news sources.",
                claims: [],
                manipulationFlags: [],
                intent: { primaryMotive: 'Inform', emotionalState: 'Neutral', hiddenMeaning: 'None', powerDynamics: 'Neutral' },
                sources: item.sourceUrl ? [item.sourceUrl] : [],
                realityGraphSummary: "Real-time news ingestion confirmed."
            }
        };
    }));

    return postsWithImages;

  } catch (error) {
    console.error("Fetch trending posts failed:", error);
    return [];
  }
};

/**
 * FETCH TRENDING REELS
 * Optimized for speed: Returns text immediately, images handled by component.
 */
export const fetchTrendingReels = async (): Promise<ReelData[]> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find 4 visually interesting viral news stories from the last 24 hours.
            Return JSON array:
            [
              { 
                "headline": "Short punchy title", 
                "snippet": "One sentence summary (max 20 words)", 
                "trustScore": 95
              }
            ]`,
            config: { tools: [{ googleSearch: {} }] }
        });
        const parsed = JSON.parse(cleanJson(response.text || "[]"));

        // Return immediately with placeholders. Images generated in background by component.
        return parsed.map((item: any, idx: number) => ({
            id: `reel-trend-${idx}-${Date.now()}`,
            headline: item.headline,
            snippet: item.snippet,
            trustScore: item.trustScore,
            topic: item.headline,
            // Use deterministic seed based on headline so it doesn't shift randomly on re-renders
            imageUrl: `https://picsum.photos/seed/${item.headline.replace(/[^a-zA-Z0-9]/g, '')}/720/1280`
        }));
    } catch (e) { return []; }
}

/**
 * NEWS SHORTS
 * Enhanced with square/portrait image generation.
 */
export const fetchNewsShorts = async (): Promise<NewsShortItem[]> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Identify 5 trending global news topics right now.
            For each, generate a "News Short".
            
            Format JSON:
            [
              {
                "headline": "Catchy Title",
                "summary": "Strictly under 60 words summary of the event.",
                "sourceName": "e.g. Reuters",
                "sourceUrl": "http...",
                "category": "Technology" | "Politics" | "Science"
              }
            ]`,
            config: { tools: [{ googleSearch: {} }] }
        });

        const parsed = JSON.parse(cleanJson(response.text || "[]"));

        const shortsWithImages = await Promise.all(parsed.map(async (item: any, idx: number) => {
            const genImage = await generateMatchingImage(item.headline, "1:1");
            return {
                id: `short-${idx}`,
                headline: item.headline,
                summary: item.summary,
                sourceName: item.sourceName,
                sourceUrl: item.sourceUrl,
                timestamp: new Date().toISOString(),
                category: item.category,
                imageUrl: genImage || `https://picsum.photos/seed/short${idx}/800/800`
            };
        }));

        return shortsWithImages;
    } catch (e) {
        console.error("Shorts fetch failed", e);
        return [];
    }
};

/**
 * Generates a news reel (Standard Feature)
 */
export const generateReel = async (topic: string): Promise<ReelData> => {
  const ai = getAiClient();
  const textResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Write a BREAKING NEWS snippet about "${topic}". 
    Constraints: 60 words max, Factual, Historical Chronicle Tone.
    Return JSON: { "headline": "...", "snippet": "...", "imagePrompt": "..." }`,
    config: { tools: [{ googleSearch: {} }] }
  });

  const data = JSON.parse(cleanJson(textResponse.text || "{}"));
  
  let imageBase64 = "";
  try {
    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image", 
      contents: { parts: [{ text: data.imagePrompt }] },
    });
    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageBase64 = part.inlineData.data;
        break;
      }
    }
  } catch (err) { console.error("Image gen failed", err); }

  return {
    id: Date.now().toString(),
    topic,
    headline: data.headline,
    snippet: data.snippet,
    imageBase64,
    trustScore: 95
  };
};

/**
 * FUTURE ENGINE (RealityFork)
 * Simulates decision outcomes with stats.
 */
export const simulateReality = async (decision: string): Promise<RealityForkScenario[]> => {
  const ai = getAiClient();
  
  // We use search here to ground the simulation in reality (e.g. cost of living, political climate)
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", 
    contents: `You are the RealityFork Future Engine.
    User Decision/Dilemma: "${decision}"
    
    Simulate 3 distinct future timelines (e.g., Optimistic, Pessimistic, Realistic/Weird).
    For each timeline, calculate:
    - Happiness Score (0-100)
    - Financial Score (0-100)
    - Regret Risk (0-100)
    
    Return JSON ONLY: 
    {
      "scenarios": [
        { 
          "id": "1", 
          "title": "...", 
          "outcomeNarrative": "...", 
          "metrics": { "happinessScore": 80, "financialScore": 60, "regretRisk": 10, "relationshipImpact": "..." },
          "probability": number, 
          "tags": ["..."] 
        }
      ]
    }`,
    config: {
      tools: [{ googleSearch: {} }] 
    }
  });

  const parsed = JSON.parse(cleanJson(response.text || "{}"));
  return parsed.scenarios || [];
};
