import { NewsRssParser, NewsRssStorage, SentimentAnalyzer } from './rss-processor'
import * as Parser from 'rss-parser'

jest.mock('rss-parser')

describe('For rss processing', () => {
    let storage: NewsRssStorage
    let analyzer: SentimentAnalyzer
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
        storage = {
            storeData: jest.fn()
        }
        analyzer = {
            analyze: jest.fn(() => Promise.resolve({score: 10, magnitude: 11}))
        }
    })
    test('sentiment results are returned correctly', async () => {
        const parser = new NewsRssParser(analyzer, storage)
        const newsData = await parser.parse('https://news.com')
        expect(Parser).toHaveBeenCalledTimes(1)
        expect(analyzer.analyze).toHaveBeenCalledTimes(1)
        expect(storage.storeData).toHaveBeenCalledTimes(1)
        expect(newsData.length).toEqual(1)
        expect(newsData[0].sentimentResult.score).toEqual(10)
        expect(newsData[0].sentimentResult.magnitude).toEqual(11)
    })
})
