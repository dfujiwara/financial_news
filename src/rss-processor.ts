import Parser = require('rss-parser')

interface Message {
  data: string
}
export function processRSS(pubSubMessage: Message) {
  let parser = new Parser()
  const decodedData = Buffer.from(pubSubMessage.data, 'base64').toString()
  const { url } = JSON.parse(decodedData)
  if (!url) {
    console.log('invalid payload')
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