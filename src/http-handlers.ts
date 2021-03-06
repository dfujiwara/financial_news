import { Request, Response } from 'express'
import { get } from './rss-storage'

const millisecondsInDay = 1000 * 60 * 60 * 24
const forDays = 14

export async function retrieve(req: Request, res: Response): Promise<void> {
    const dateString = req.query.fromDateString
    const parsedDate = Date.parse(dateString)
    const fromDate = isNaN(parsedDate) ? new Date() : new Date(parsedDate)
    const toDate = new Date(fromDate.getTime() - millisecondsInDay * forDays)
    try {
        const results = await get(fromDate, toDate)
        res.set('Access-Control-Allow-Origin', '*')
        res.set('Cache-Control', 'max-age=7200')
        res.json({ results })
    } catch (e) {
        console.error(e)
        res.sendStatus(500)
    }
}
