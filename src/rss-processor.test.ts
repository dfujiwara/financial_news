import { processNewsRSS, Message } from './rss-processor'
import * as Fetcher from './rss-fetcher'

jest.mock('./rss-fetcher', () => ({ fetch: jest.fn(() => Promise.reject('fail!'))}))

describe('For rss processing', () => {
    let message: Message
    describe('if the URL parameter is missing from the pubsub data', () => {
        beforeEach(() => {
          const dataPayload = { json: { abc: "ninja" } }
          const dataPayloadJSON = JSON.stringify(dataPayload)
          message = {
            data: Buffer.from(dataPayloadJSON).toString("base64")
          }
        })
        test('an error is thrown', () => {
          expect.assertions(1)
          processNewsRSS(message).catch(e => {
            expect(e).toMatch('invalid payload: {"json":{"abc":"ninja"}')
          })
        })
    })
    describe('if the URL parameter is in the pubsub data', () => {
        beforeEach(() => {
          const dataPayload = { json: { url: "ninja" } }
          const dataPayloadJSON = JSON.stringify(dataPayload)
          message = {
            data: Buffer.from(dataPayloadJSON).toString("base64")
          }
        })
        test('processing RSS happens', async () => {
          try {
            await processNewsRSS(message)
            fail()
          } catch (e) {
            expect(Fetcher.fetch).toHaveBeenCalledTimes(1)
            expect(e).toMatch('fail!')
          }
        })
    })
})