export interface SentimentAnalysisResult {
  score: number,
  magnitude: number
}

export interface NewsData {
  title: string,
  link: string,
  date: string,
  contentSnippet: string
}

export interface AnalyzedNewsData extends NewsData {
  sentimentResult: SentimentAnalysisResult
}
