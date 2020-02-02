import { Request, Response } from 'express';
import { get } from './rss-storage'

export async function retrieve(req: Request, res: Response) {
  const fromDate = new Date()
  const forDays = 14
  const millisecondsInDay = 1000 * 60 * 60 * 24
  const toDate = new Date(fromDate.getTime() - millisecondsInDay * forDays)
  try {
    const results = await get(fromDate, toDate)
    res.json(results)
  } catch (e) {
    console.error(e);
    res.sendStatus(500)
  }
}
