import * as Parser from 'rss-parser'
import { LanguageServiceClient } from '@google-cloud/language'

export interface SentimentAnalysisResult {
  score: number,
  magnitude: number
}

export class NewsRssParser {
  async parse(url: string): Promise<SentimentAnalysisResult[]> {
    let feed = await this.fetchRSS(url)
    const promises = feed.items.map(item => {
      return this.analyzeSentiment(`${item.title}:${item.contentSnippet}`)
    })
    return Promise.all(promises)
  }
  private async fetchRSS(url: string) {
    let parser = new Parser()
    let feed = await parser.parseURL(url)
    return feed
  }
  private async analyzeSentiment(content: string): Promise<SentimentAnalysisResult> {
    const client = new LanguageServiceClient()
    const document = {
      content,
      type: "PLAIN_TEXT"
    }
    const [result] = await client.analyzeSentiment({ document: document })
    const sentiment = result.documentSentiment
    return {score: sentiment.score, magnitude: sentiment.magnitude}
  }
}
