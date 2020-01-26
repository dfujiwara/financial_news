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

export interface RSSFetcher {
  fetch(url: string): Promise<FetchedItem[]>
}

export interface SentimentAnalyzer {
  analyze(content: string): Promise<SentimentAnalysisResult>
}

export interface NewsRssStorage {
  storeData(data: NewsData): Promise<void>
}

export class NewsRssParser {
  private readonly fetcher: RSSFetcher
  private readonly analyzer: SentimentAnalyzer
  private readonly storage: NewsRssStorage

  constructor(fetcher: RSSFetcher = new Fetcher(), analyzer: SentimentAnalyzer = new Analyzer(), storage: NewsRssStorage = new Storage()) {
    this.fetcher = fetcher
    this.analyzer = analyzer
    this.storage = storage
  }

  async parse(url: string): Promise<NewsData[]> {
    let items = await this.fetcher.fetch(url)
    const promises = items.map(async item => {
      const sentimentResult = await this.analyzer.analyze(`${item.title}:${item.contentSnippet}`)
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
}

class Fetcher implements RSSFetcher {
  private readonly parser: Parser

  constructor() {
    this.parser = new Parser()
  }

  async fetch(url: string): Promise<FetchedItem[]> {
    const results = await this.parser.parseURL(url)
    return results.items.map((item) => {
      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet
      }
    })
  }
}

class Analyzer implements SentimentAnalyzer {
  private readonly client: LanguageServiceClient

  constructor() {
    this.client = new LanguageServiceClient()
  }
  async analyze(content: string): Promise<SentimentAnalysisResult> {
    const document = {
      content,
      type: "PLAIN_TEXT"
    }
    const [result] = await this.client.analyzeSentiment({ document: document })
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
