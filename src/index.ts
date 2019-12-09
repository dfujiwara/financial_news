import Parser = require('rss-parser')
import { rssURLList } from './rssConfig'

let parser = new Parser()
let run = async (url: string) => {
  let feed = await parser.parseURL(url)
  console.log(feed.title)

  feed.items.forEach(item => {
    console.log(item.title + ":" + item.link)
  })
}

rssURLList.map((url) => {
    run(url)
})
