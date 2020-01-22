import { processNewsRSS, Message } from './rss-processor'
import * as Parser from 'rss-parser'
import { LanguageServiceClient } from '@google-cloud/language'

jest.mock('rss-parser')
jest.mock('@google-cloud/language')
describe('For rss processing', () => {
    describe('if the URL parameter is missing from the pubsub data', () => {
        let message: Message
        beforeEach(() => {
            const dataPayload = {json: {abc: 'ninja'}}
            const dataPayloadJSON = JSON.stringify(dataPayload)
            message = {data: Buffer.from(dataPayloadJSON).toString('base64')}
        })
        test('an error is thrown', () => {
            expect.assertions(1)
            processNewsRSS(message).catch(e => {
                expect(e).toMatch('invalid payload: {"json":{"abc":"ninja"}')
            })
        })
    })
    describe('with valid URL parameter in the pubsub data', () => {
        let message: Message
        beforeEach(() => {
            const dataPayload = {json: {url: 'https://news.com'}}
            const dataPayloadJSON = JSON.stringify(dataPayload)
            message = {data: Buffer.from(dataPayloadJSON).toString('base64')}
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
            const sentimentResults = await processNewsRSS(message)
            expect(Parser).toHaveBeenCalledTimes(1)
            expect(LanguageServiceClient).toHaveBeenCalledTimes(1)
            expect(sentimentResults.length).toEqual(1)
            expect(sentimentResults[0].score).toEqual(10)
            expect(sentimentResults[0].magnitude).toEqual(11)
        })
    })
})
