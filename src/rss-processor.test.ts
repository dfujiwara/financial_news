import { NewsRssParser, StorageClosure, FetchClosure, AnalyzeClosure } from './rss-processor'
import { AnalyzedNewsData } from './data-models'

describe('For rss processing', () => {
    let fetch: FetchClosure
    let store: StorageClosure
    let analyze: AnalyzeClosure
    beforeEach(() => {
        fetch = jest.fn(() =>
          Promise.resolve([
            {
              title: "title",
              link: "https://link.news.com",
              date: "",
              contentSnippet: "snippet"
            }
          ])
        )
        store = jest.fn((data: AnalyzedNewsData) => Promise.resolve(data))
        analyze = jest.fn(() => Promise.resolve({score: 10, magnitude: 11}))
    })
    test('sentiment results are returned correctly', async () => {
        const parser = new NewsRssParser(fetch, analyze, store)
        const newsData = await parser.parse('https://news.com')
        expect(fetch).toHaveBeenCalledTimes(1)
        expect(analyze).toHaveBeenCalledTimes(1)
        expect(store).toHaveBeenCalledTimes(1)
        expect(newsData.length).toEqual(1)
        expect(newsData[0].sentimentResult.score).toEqual(10)
        expect(newsData[0].sentimentResult.magnitude).toEqual(11)
    })
})
