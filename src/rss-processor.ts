import { fetch } from './rss-fetcher'
import { analyze } from './sentiment-analysis'
import { store } from './rss-storage'
import { AnalyzedNewsData } from './data-models'

export interface Message {
    data: string
}

export async function processNewsRSS(pubSubMessage: Message): Promise<AnalyzedNewsData[]> {
    const decodedData = Buffer.from(pubSubMessage.data, 'base64').toString()
    const {
        json: { url: url },
    } = JSON.parse(decodedData)
    if (!url) {
        const error = `invalid payload: ${decodedData}`
        console.error(error)
        throw error
    }
    const newsDataList = await fetch(url)
    const promises = newsDataList.map(async data => {
        const analyzedData = await analyze(data)
        return store(analyzedData)
    })
    return Promise.all(promises)
}
