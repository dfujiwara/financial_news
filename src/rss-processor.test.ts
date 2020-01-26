import { NewsRssParser } from './rss-processor'
import * as Parser from 'rss-parser'
import { LanguageServiceClient } from '@google-cloud/language'

jest.mock('rss-parser')
jest.mock('@google-cloud/language')
describe('For rss processing', () => {
    beforeEach(() => {
        Parser.prototype.parseURL = jest.fn(
            (
            feedUrl: string,
            callback?: (err: Error, feed: Parser.Output) => void,
            redirectCount?: number
            ) => {
                return Promise.resolve({
                    items: [
                        {
                        title: "title",
                        link: "https://link.news.com",
                        pubDate: "",
                        contentSnipped: "snippet"
                        }
                    ]
                    })
            }
        )
        LanguageServiceClient.prototype.analyzeSentiment = jest.fn((document: {[index: string]: any}) => {
            return Promise.resolve([{documentSentiment: {score: 10, magnitude: 11}}])
        })
    })
    test('sentiment results are returned correctly', async () => {
        const parser = new NewsRssParser()
        const sentimentResults = await parser.parse('https://news.com')
        expect(Parser).toHaveBeenCalledTimes(1)
        expect(LanguageServiceClient).toHaveBeenCalledTimes(1)
        expect(sentimentResults.length).toEqual(1)
        expect(sentimentResults[0].score).toEqual(10)
        expect(sentimentResults[0].magnitude).toEqual(11)
    })
})
