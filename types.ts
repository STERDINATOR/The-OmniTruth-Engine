
export enum Verdict {
  TRUE = 'TRUE',
  MOSTLY_TRUE = 'MOSTLY_TRUE',
  PARTIALLY_TRUE = 'PARTIALLY_TRUE',
  MISLEADING = 'MISLEADING',
  FAKE = 'FAKE',
  UNVERIFIED = 'UNVERIFIED',
  SATIRE = 'SATIRE'
}

export enum CommunityRole {
  JOURNALIST = 'Journalist',
  EXPERT = 'Expert',
  EYEWITNESS = 'Eyewitness',
  CITIZEN = 'Citizen'
}

export interface Claim {
  id: string;
  text: string;
  status: 'SUPPORTED' | 'CONTRADICTED' | 'INSUFFICIENT';
  confidence: number;
  reasoning: string;
}

export interface ManipulationFlag {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
}

export interface IntentAnalysis {
  primaryMotive: string;
  emotionalState: string;
  hiddenMeaning: string;
  powerDynamics: string;
}

export interface DeepAnalysisResult {
  trustScore: number; // 0-100
  verdict: Verdict;
  summary: string;
  claims: Claim[];
  manipulationFlags: ManipulationFlag[];
  intent: IntentAnalysis;
  sources: string[];
  realityGraphSummary: string; // The synthesis layer
}

export interface CommunityVote {
  userId: string;
  userCredibility: number; // Added: Snapshot of user score at time of vote
  role: CommunityRole;
  verdict: 'REAL' | 'FAKE' | 'UNSURE';
  reason: string;
  timestamp: string;
}

export interface Post {
  id: string;
  author: string;
  authorRole?: string;
  content: string;
  image?: string;
  timestamp: string;
  trustScore: number;
  crowdScore: number;
  verdict: Verdict;
  type: 'POST' | 'REEL' | 'GENERATED_REEL';
  verificationDetails?: DeepAnalysisResult; // Updated to use DeepAnalysisResult
  votes?: CommunityVote[];
  likes?: number;
  comments?: number;
  hasLiked?: boolean;
}

export interface ReelData {
  id: string;
  headline: string;
  snippet: string; // Max 60 words
  imageBase64?: string;
  imageUrl?: string; // Added for web-sourced images
  topic: string;
  trustScore: number;
}

export interface NewsShortItem {
  id: string;
  headline: string;
  summary: string; // Strict 60 words
  sourceName: string;
  sourceUrl: string;
  timestamp: string;
  category: string;
  imagePrompt?: string; // For generating a placeholder/visual
  imageUrl?: string; // Added for web-sourced images
}

export interface FutureMetrics {
  happinessScore: number; // 0-100
  financialScore: number; // 0-100
  regretRisk: number; // 0-100
  relationshipImpact: string;
}

export interface RealityForkScenario {
  id: string;
  title: string;
  outcomeNarrative: string;
  metrics: FutureMetrics;
  probability: number;
  tags: string[];
}

export interface SearchFilters {
  dateRange: 'ALL' | 'LAST_24H' | 'LAST_WEEK' | 'LAST_MONTH' | 'LAST_YEAR';
  authorRole: 'ALL' | 'Journalist' | 'Expert' | 'Eyewitness' | 'Citizen';
  verdict: 'ALL' | 'TRUE' | 'MOSTLY_TRUE' | 'PARTIALLY_TRUE' | 'MISLEADING' | 'FAKE' | 'UNVERIFIED' | 'SATIRE';
}
