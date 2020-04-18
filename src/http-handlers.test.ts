import { Request, Response } from 'express'
import { retrieve } from './http-handlers'
import * as Storage from './rss-storage'

jest.mock('./rss-storage', () => ({
    get: jest.fn(() => Promise.resolve([])),
}))

describe('For handling HTTP GET request', () => {
    let request: Partial<Request>
    let response: Partial<Response>
    beforeEach(() => {
        response = {
            sendStatus: (): Response => {
                return {} as Response
            },
            set: (): Response => {
                return {} as Response
            },
            json: (): Response => {
                return {} as Response
            },
        }
    })
    test('uses the appropriate date provided in the request', async () => {
        const fromDate = new Date('2020-04-18')
        request = { query: { fromDateString: fromDate.toISOString() } }
        await retrieve(request as Request, response as Response)
        expect(Storage.get).toHaveBeenCalledTimes(1)
        const millisecondsInDay = 1000 * 60 * 60 * 24
        expect(Storage.get).toHaveBeenCalledWith(fromDate, new Date(fromDate.getTime() - 14 * millisecondsInDay))
    })
    test('uses the default appropriate date', async () => {
        request = { query: { fromDateString: 'abc' } }
        await retrieve(request as Request, response as Response)
        expect(Storage.get).toHaveBeenCalledTimes(1)
    })
})
