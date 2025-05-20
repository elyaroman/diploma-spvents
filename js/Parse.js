// const fs = require('fs').promises

// async function appendDataToFile(data) {
//   try {
//     await fs.appendFile('../data/data.json', JSON.stringify(data, null, 2))
//   } catch (err) {
//     console.error(err)
//   }
// }

function normalizeData(data) {
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toISOString().split('T')[0];

  data.forEach(parseEvent => {
    parseEvent['organizer'] = 'unknown'
    parseEvent['category'] = 'another'
    parseEvent['is_child_friendly'] = (parseEvent['ageLimit'] === '18+') ? 'off' : 'on'
    delete parseEvent['ageLimit']

    const rawDate = parseEvent['date']?.trim() || '';

    if (rawDate.includes("Круглый год") || rawDate.includes("весь день") || rawDate.includes("смотреть расписание")) {
      parseEvent['date'] = formattedCurrentDate;
      parseEvent['time_start'] = '00:00';
      parseEvent['time_end'] = '23:59';
    } else {
      const dateParts = rawDate.split('–');
      if (dateParts.length > 1) {
        parseEvent['date'] = formattedCurrentDate;
        parseEvent['time_start'] = '00:00';
        parseEvent['time_end'] = '23:59';
      } else {
        const timeMatch = rawDate.match(/(\d{1,2}:\d{2})/);
        if (timeMatch) {
          const time = timeMatch[0];
          parseEvent['time_start'] = time;
          parseEvent['time_end'] = time;
          parseEvent['date'] = rawDate.replace(time, '').trim();
        } else {
          parseEvent['time_start'] = '00:00';
          parseEvent['time_end'] = '23:59';
          parseEvent['date'] = rawDate;
        }
      }

      if (parseEvent['date']) {
        const dateObj = new Date(parseEvent['date']);
        if (!isNaN(dateObj.getTime())) {
          parseEvent['date'] = dateObj.toISOString().split('T')[0];
        }
      }
    }
  });
  console.log(data);
  return data
}
import puppeteer from 'puppeteer';
// const puppeteer = require('puppeteer')

async function parseWebsites(urlsWithSelectors) {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()

  let allEvents = []

  for (const { url, selectors } of urlsWithSelectors) {
    await page.goto(url, { timeout: 120000 })

    const events = await page.evaluate((selectors) => {
      const events = []

      const eventElements = document.querySelectorAll(selectors.eventList)
      for (const element of eventElements) {
        const event = {}

        for (const [key, selector] of Object.entries(selectors)) {
          switch (key) {
            case 'eventList':
            case 'link':
              continue
            case 'image':
              event[key] = element.querySelector(selector)?.getAttribute('data-src') ?? 'images/event/event-default.jpg';
              break
            default:
              if (selector) event[key] = element.querySelector(selector)?.innerText || ''
              else event[key] = ''
              break
          }
        }

        event.link = element.querySelector(selectors.link)?.href || ''

        if (Object.entries(event).filter(([key]) => key !== 'image').every(([, value]) => value === '')) continue;

        events.push(event)
      }

      return events
    }, selectors)

    allEvents.push(...events)

    console.log(events);
  }

  // await appendDataToFile(allEvents)

  let normalizedData = normalizeData(allEvents)
  await browser.close()
  console.log(normalizeData);
  return normalizeData
}

let urlsWithSelectors = [
  {
    url: 'https://afisha.yandex.ru/saint-petersburg/selections/all-events-free',
    selectors: {
      eventList: '.event',
      date: '.DetailsItem-fq4hbj-1',
      place: '.PlaceLink-fq4hbj-2',
      name: '.Title-fq4hbj-3',
      description: '',
      ageLimit: '',
      image: '.jYbobS',
      link: '.EventLink-sc-1x07jll-2',
    },
  },
  {
    url: 'https://kudago.com/spb/events/?date=2025-05-20&only_free=y',
    selectors: {
      eventList: '.post',
      date: '.post-detail',
      place: '.post-detail--event-place',
      name: '.post-title-link',
      description: '.post-description',
      ageLimit: '.list-age-restriction-big',
      image: '.post-image-src',
      link: '.post-image-link',
    }
  }
]

parseWebsites(urlsWithSelectors)

export { parseWebsites }
