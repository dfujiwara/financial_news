import * as Parser from 'rss-parser'
import { fetch } from './rss-fetcher'

jest.mock('rss-parser')

describe('For fetching rss', () => {
  describe('with all information is available in rss', () => {
    beforeEach(() => {
        Parser.prototype.parseURL = jest.fn(() =>
          Promise.resolve({items: [
            {
              title: 'title',
              link: 'https://link.news.com',
              pubDate: '2020-01-29',
              contentSnippet: 'snippet'
            }
          ]})
        )
    })
    test('appropriate news data is created', async () => {
        const data = await fetch('https://news.com')
        expect(Parser.prototype.parseURL).toHaveBeenCalledTimes(1)
        expect(data.length).toBe(1)
        const firstItem = data[0]
        expect(firstItem.title).toBe('title')
        expect(firstItem.link).toBe('https://link.news.com')
        expect(firstItem.date).toStrictEqual(new Date('2020-01-29'))
        expect(firstItem.contentSnippet).toBe('snippet')
    })
  })
  describe('with no information is available in rss', () => {
    beforeEach(() => {
        Parser.prototype.parseURL = jest.fn(() =>
          Promise.resolve({items: [
            {}
          ]})
        )
    })
    test('appropriate news data is created', async () => {
        const data = await fetch('https://news.com')
        expect(Parser.prototype.parseURL).toHaveBeenCalledTimes(1)
        expect(data.length).toBe(1)
        const firstItem = data[0]
        expect(firstItem.title).toBe('undefined')
        expect(firstItem.link).toBe('undefined')
        expect(firstItem.date.toString()).toEqual(new Date('undefined').toString())
        expect(firstItem.contentSnippet).toBe('undefined')
    })
  })
})
