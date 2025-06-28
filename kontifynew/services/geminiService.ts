import { apiAnalyzeLeadQuery } from './apiService';
import type { AIAnalysis } from '../types';

/**
 * This service acts as an abstraction layer for the Gemini AI analysis feature.
 * It calls the backend API endpoint, which in turn securely communicates with the Google Gemini API.
 * This keeps the API key and complex prompt logic off the client-side.
 */
export const analyzeLeadQuery = async (query: string): Promise<AIAnalysis | null> => {
  // apiAnalyzeLeadQuery will call the backend. On success, it returns the JSON payload.
  // We expect a payload like: { success: true, analysis: { ... } }
  const result = await apiAnalyzeLeadQuery(query);
  
  if (result && result.analysis) {
    return result.analysis;
  }
  
  // The apiService handles logging the error, so we just return null here.
  return null;
};
