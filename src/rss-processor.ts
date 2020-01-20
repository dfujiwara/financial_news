import * as Parser from 'rss-parser'
import { LanguageServiceClient } from '@google-cloud/language'
import { Firestore, WriteResult } from '@google-cloud/firestore'

interface SentimentAnalysisResult {
  score: number,
  magnitude: number
}
export interface NewsData {
  title: string,
  link: string,
  sentimentResult: {score: number, magnitude: number},
  date: string
}

export interface NewsRssStorage {
  storeData(data: NewsData): Promise<void>
}

export class NewsRssParser {
  private readonly storage: NewsRssStorage
  constructor(storage: NewsRssStorage = new Storage()) {
    this.storage = storage
  }

  async parse(url: string): Promise<NewsData[]> {
    let feed = await this.fetchRSS(url)
    const promises = feed.items.map(async item => {
      const sentimentResult = await this.analyzeSentiment(`${item.title}:${item.contentSnippet}`)
      const data = {
        title: item.title,
        sentimentResult,
        link: item.link,
        date: item.pubDate
      }
      await this.storage.storeData(data)
      return data
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

class Storage implements NewsRssStorage  {
  private readonly firestore: Firestore
  private readonly collectionName = 'financial-rss-feed'

  constructor() {
    this.firestore = new Firestore()
  }

  async storeData(data: NewsData): Promise<void> {
    const docRef = this.firestore.collection(this.collectionName).doc(data.title)
    await docRef.set(data)
    return Promise.resolve()
  }
}