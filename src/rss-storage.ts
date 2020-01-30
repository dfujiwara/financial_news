import { Firestore } from '@google-cloud/firestore'
import { AnalyzedNewsData } from './data-models'

async function storeData(data: AnalyzedNewsData): Promise<AnalyzedNewsData> {
    const firestore = new Firestore()
    const collectionName = 'financial-rss-feed'
    const docRef = firestore.collection(collectionName).doc(data.title)
    await docRef.set(data)
    return data
}
