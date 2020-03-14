import { LanguageServiceClient } from '@google-cloud/language'
import { analyze } from './sentiment-analysis'
import { NewsData } from './data-models'

jest.mock('@google-cloud/language')

describe('For analyzing sentiment of rss', () => {
    let newsData: NewsData
    beforeEach(() => {
        newsData = {
            title: 'abc',
            link: 'https://news.com',
            date: new Date('2020-01-29'),
            contentSnippet: 'abc',
        }
        LanguageServiceClient.prototype.analyzeSentiment = jest.fn(() =>
            Promise.resolve([
                {
                    documentSentiment: { score: 10, magnitude: 11 },
                },
            ]),
        )
    })
    test('appropriate sentiment data with score and magnitude is created', async () => {
        const analyzedData = await analyze(newsData)
        expect(LanguageServiceClient.prototype.analyzeSentiment).toHaveBeenCalledTimes(1)
        expect(analyzedData.sentimentResult.score).toBe(10)
        expect(analyzedData.sentimentResult.magnitude).toBe(11)
        expect(analyzedData.title).toBe('abc')
    })
})
