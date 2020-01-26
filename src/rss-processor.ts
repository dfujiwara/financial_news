import * as Parser from 'rss-parser'
import { LanguageServiceClient } from '@google-cloud/language'
import { Firestore } from '@google-cloud/firestore'

export interface SentimentAnalysisResult {
  score: number,
  magnitude: number
}
export interface NewsData {
  title: string,
  link: string,
  sentimentResult: {score: number, magnitude: number},
  date: string
}

export interface FetchedItem {
  title?: string,
  link?: string,
  pubDate?: string,
  contentSnippet?: string
}

export type FetchClosure = (url: string) => Promise<FetchedItem[]>
export type AnalyzeClosure = (content: string) => Promise<SentimentAnalysisResult>
export type StorageClosure = (data: NewsData) => Promise<void>

export class NewsRssParser {
  private readonly fetch: FetchClosure
  private readonly analyze: AnalyzeClosure
  private readonly store: StorageClosure

  constructor(fetchClosure: FetchClosure = fetch, analyzeClosure: AnalyzeClosure = analyze, storageClosure: StorageClosure = storeData)  {
    this.fetch = fetchClosure
    this.analyze = analyzeClosure
    this.store = storageClosure
  }

  async parse(url: string): Promise<NewsData[]> {
    let items = await this.fetch(url)
    const promises = items.map(async item => {
      const sentimentResult = await this.analyze(`${item.title}:${item.contentSnippet}`)
      const data = {
        title: item.title,
        sentimentResult,
        link: item.link,
        date: item.pubDate
      }
      await this.store(data)
      return data
    })
    return Promise.all(promises)
  }
}

async function fetch(url: string): Promise<FetchedItem[]> {
  const parser = new Parser()
  const results = await parser.parseURL(url)
  return results.items.map((item) => {
    return {
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet
    }
  })
}

async function analyze(content: string): Promise<SentimentAnalysisResult> {
  const document = {
    content,
    type: "PLAIN_TEXT"
  }
  const client = new LanguageServiceClient()
  const [result] = await client.analyzeSentiment({ document: document })
  const sentiment = result.documentSentiment
  return {score: sentiment.score, magnitude: sentiment.magnitude}
}

async function storeData(data: NewsData): Promise<void> {
    const firestore = new Firestore()
    const collectionName = 'financial-rss-feed'
    const docRef = firestore.collection(collectionName).doc(data.title)
    await docRef.set(data)
    return Promise.resolve()
}
