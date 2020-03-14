export interface SentimentAnalysisResult {
    score: number
    magnitude: number
}

export interface NewsData {
    title: string
    link: string
    date: Date
    contentSnippet: string
}

export interface AnalyzedNewsData extends NewsData {
    sentimentResult: SentimentAnalysisResult
}
