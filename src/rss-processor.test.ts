import { NewsRssParser, NewsRssStorage, SentimentAnalyzer, RSSFetcher } from './rss-processor'

describe('For rss processing', () => {
    let fetcher: RSSFetcher
    let storage: NewsRssStorage
    let analyzer: SentimentAnalyzer
    beforeEach(() => {
        fetcher = {
          fetch: jest.fn(() =>
            Promise.resolve([
              {
                title: "title",
                link: "https://link.news.com",
                pubDate: "",
                contentSnipped: "snippet"
              }
            ])
          )
        }
        storage = {
            storeData: jest.fn()
        }
        analyzer = {
            analyze: jest.fn(() => Promise.resolve({score: 10, magnitude: 11}))
        }
    })
    test('sentiment results are returned correctly', async () => {
        const parser = new NewsRssParser(fetcher, analyzer, storage)
        const newsData = await parser.parse('https://news.com')
        expect(fetcher.fetch).toHaveBeenCalledTimes(1)
        expect(analyzer.analyze).toHaveBeenCalledTimes(1)
        expect(storage.storeData).toHaveBeenCalledTimes(1)
        expect(newsData.length).toEqual(1)
        expect(newsData[0].sentimentResult.score).toEqual(10)
        expect(newsData[0].sentimentResult.magnitude).toEqual(11)
    })
})
