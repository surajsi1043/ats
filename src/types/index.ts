export interface AnalysisResponse {
  score: number;
  missing_keywords: string[];
  indian_market_tips: string[];
  verdict: "Strong Match" | "Moderate Match" | "Weak Match";
}

export interface AnalysisRequest {
  resume_text: string;
  jd_text: string;
}