import { processNewsRSS } from './rss-processor'
import * as Parser from 'rss-parser'
import * as Language from '@google-cloud/language'

jest.mock('rss-parser')
jest.mock('@google-cloud/language')
describe('For rss processing', () => {
    test('', () => {
        expect.assertions(1)
        const dataPayload = {json: {abc: 'ninja'}}
        const dataPayloadJSON = JSON.stringify(dataPayload)
        const message = {data: Buffer.from(dataPayloadJSON).toString('base64')}
        processNewsRSS(message).catch(e => {
            expect(e).toMatch('invalid payload: {"json":{"abc":"ninja"}')
        })
    })
})
