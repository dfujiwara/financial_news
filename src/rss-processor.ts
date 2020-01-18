import * as Parser from 'rss-parser'

interface Message {
  data: string
}
export function processNewsRSS(pubSubMessage: Message) {
  let parser = new Parser()
  const decodedData = Buffer.from(pubSubMessage.data, 'base64').toString()
  const { url } = JSON.parse(decodedData)
  if (!url) {
    console.error(`invalid payload: ${decodedData}`)
    return
  }
  let run = async (url: string) => {
    let feed = await parser.parseURL(url)
    console.log(feed.title)
    feed.items.forEach(item => {
      console.log(item.title + ":" + item.link)
    })
  }
  return run(url)
}