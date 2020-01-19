import * as Parser from 'rss-parser'
import * as Language from '@google-cloud/language'

interface Message {
  data: string
}

interface SentimentAnalysisResult {
  score: number,
  magnitude: number
}

export async function processNewsRSS(pubSubMessage: Message): Promise<SentimentAnalysisResult[]> {
  let parser = new Parser()
  const decodedData = Buffer.from(pubSubMessage.data, 'base64').toString()
  const { json: { url: url} } = JSON.parse(decodedData)
  if (!url) {
    console.error(`invalid payload: ${decodedData}`)
    return
  }
  let feed = await parser.parseURL(url)
  const promises = feed.items.map(item => {
    console.log(item.title + ":" + item.link)
    return analyzeSentiment(`${item.title}:${item.contentSnippet}`)
  })
  return Promise.all(promises)
}

async function analyzeSentiment(content: string): Promise<SentimentAnalysisResult> {
  const client = new Language.LanguageServiceClient()
  const document = {
    content,
    type: "PLAIN_TEXT"
  }
  const [result] = await client.analyzeSentiment({ document: document })
  const sentiment = result.documentSentiment
  console.log(`Text: ${content}`)
  console.log(`Sentiment score: ${sentiment.score}`)
  console.log(`Sentiment magnitude: ${sentiment.magnitude}`)
  return {score: sentiment.score, magnitude: sentiment.magnitude}
}
