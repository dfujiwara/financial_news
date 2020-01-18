import { rssURLList } from './rss-config'
import { PubSub } from '@google-cloud/pubsub'

export function dispatchFinancialNewsProcessing () {
    const pubsub = new PubSub()
    const topic = pubsub.topic('financial_new_dispatcher')
    const promises = rssURLList.map(url => {
        const json = { url }
        return topic.publishJSON({ json })
    })
    return Promise.all(promises)
}