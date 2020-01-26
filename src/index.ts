import { NewsRssParser, SentimentAnalysisResult } from './rss-processor'
export { dispatchFinancialNewsProcessing } from './dispatcher'

export interface Message {
  data: string
}

export async function processNewsRSS(pubSubMessage: Message): Promise<SentimentAnalysisResult[]> {
  const decodedData = Buffer.from(pubSubMessage.data, 'base64').toString()
  const { json: { url: url} } = JSON.parse(decodedData)
  if (!url) {
    const error = `invalid payload: ${decodedData}`
    console.error(error)
    throw error
  }
  const parser = new NewsRssParser()
  return parser.parse(url)
}
