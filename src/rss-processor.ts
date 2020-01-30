import * as Parser from 'rss-parser'
import { LanguageServiceClient } from '@google-cloud/language'
import { Firestore } from '@google-cloud/firestore'
import { NewsData, AnalyzedNewsData, SentimentAnalysisResult} from './data-models'

export type FetchClosure = (url: string) => Promise<NewsData[]>
export type AnalyzeClosure = (content: string) => Promise<SentimentAnalysisResult>
export type StorageClosure = (data: AnalyzedNewsData) => Promise<AnalyzedNewsData>

export class NewsRssParser {
  private readonly fetch: FetchClosure
  private readonly analyze: AnalyzeClosure
  private readonly store: StorageClosure

  constructor(fetchClosure: FetchClosure = fetch, analyzeClosure: AnalyzeClosure = analyze, storageClosure: StorageClosure = storeData)  {
    this.fetch = fetchClosure
    this.analyze = analyzeClosure
    this.store = storageClosure
  }

  async parse(url: string): Promise<AnalyzedNewsData[]> {
    let items = await this.fetch(url)
    const promises = items.map(async item => {
      const sentimentResult = await this.analyze(`${item.title}:${item.contentSnippet}`)
      return this.store({ ...item, sentimentResult })
    })
    return Promise.all(promises)
  }
}

async function fetch(url: string): Promise<NewsData[]> {
  const parser = new Parser()
  const results = await parser.parseURL(url)
  return results.items.map((item) => ({
      title: item.title || 'undefined',
      link: item.link || 'undefined',
      date: item.pubDate || 'undefined',
      contentSnippet: item.contentSnippet || 'undefined'
  }))
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

async function storeData(data: AnalyzedNewsData): Promise<AnalyzedNewsData> {
    const firestore = new Firestore()
    const collectionName = 'financial-rss-feed'
    const docRef = firestore.collection(collectionName).doc(data.title)
    await docRef.set(data)
    return data
}
