import * as Parser from 'rss-parser'
import { fetch } from './rss-fetcher'

jest.mock('rss-parser')

describe('For fetching rss', () => {
    beforeEach(() => {
        Parser.prototype.parseURL = jest.fn(() =>
          Promise.resolve({items: [
            {
              title: "title",
              link: "https://link.news.com",
              date: "",
              contentSnippet: "snippet"
            }
          ]})
        )
    })
    test('appropriate news data is created', async () => {
        const data = await fetch('https://news.com')
        expect(Parser.prototype.parseURL).toHaveBeenCalledTimes(1)
        expect(data.length).toBe(1)
    })
})
