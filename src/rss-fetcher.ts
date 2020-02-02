import * as Parser from 'rss-parser'
import { NewsData } from './data-models'

export async function fetch(url: string): Promise<NewsData[]> {
  const parser = new Parser()
  const results = await parser.parseURL(url)
  return results.items.map((item) => ({
      title: item.title || 'undefined',
      link: item.link || 'undefined',
      date: new Date(item.pubDate),
      contentSnippet: item.contentSnippet || 'undefined'
  }))
}
