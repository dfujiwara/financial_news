import { processNewsRSS, Message } from './rss-processor'
import * as Parser from 'rss-parser'
import * as Language from '@google-cloud/language'

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
})
