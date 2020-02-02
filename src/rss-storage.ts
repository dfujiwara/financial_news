import { Firestore } from '@google-cloud/firestore'
import { AnalyzedNewsData } from './data-models'
import * as crypto from 'crypto'

const collectionName = 'financial-rss-feed'

export async function store(data: AnalyzedNewsData): Promise<AnalyzedNewsData> {
    const firestore = new Firestore()
    const hashableContent = `${data.link}`
    const hash = crypto.createHash('sha1').update(hashableContent).digest('hex')
    const docRef = firestore.collection(collectionName).doc(hash)
    await docRef.set(data)
    return data
}

export async function get(fromDate: Date = new Date(), forDays: number): Promise<AnalyzedNewsData[]> {
    const millisecondsInDay = 1000 * 60 * 60 * 24
    const toDate = new Date(fromDate.getTime() - (millisecondsInDay * forDays))
    const firestore = new Firestore()
    const collection = firestore.collection(collectionName)
    const snapShot = await collection
        .where('date', '<=', fromDate)
        .where('date', '>', toDate)
        .get()
    return snapShot.docs.map(doc => {
        const data = doc.data() as AnalyzedNewsData
        return {
            title: data.title,
            link: data.link,
            date: data.date,
            contentSnippet: data.contentSnippet,
            sentimentResult: data.sentimentResult
        }
    })
}
