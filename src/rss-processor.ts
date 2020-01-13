import Parser = require('rss-parser')

export function processRSS(data: string) {
  let parser = new Parser()
  const {url } = JSON.parse(data)
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