import { processNewsRSS, Message } from './index'
import { NewsRssParser } from './rss-processor'

jest.mock('./rss-processor')
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
        });
        test('NewsRssParser is called to process RSS', async () => {
            await processNewsRSS(message)
            expect(NewsRssParser).toHaveBeenCalledTimes(1)
        })
    })
})
