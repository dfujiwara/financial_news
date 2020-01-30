import { LanguageServiceClient } from '@google-cloud/language'
import { NewsData, AnalyzedNewsData } from './data-models'

export async function analyze(data: NewsData): Promise<AnalyzedNewsData> {
  const content = `${data.title}:${data.contentSnippet}`
  const document = {
    content,
    type: "PLAIN_TEXT"
  }
  const client = new LanguageServiceClient()
  const [result] = await client.analyzeSentiment({ document: document })
  const sentiment = result.documentSentiment
  return {...data, sentimentResult: {score: sentiment.score, magnitude: sentiment.magnitude}}
}
