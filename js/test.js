// parse.js

const fs = require('fs').promises

async function appendDataToFile(data) {
  try {
    await fs.appendFile('../data/data.json', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error(err)
  }
}

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

const puppeteer = require('puppeteer')

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
              // if (document.URL.includes('afisha.yandex.ru')) {
              //   event[key] = element.querySelector(selector)?.getAttribute('data-src') ?? '';
              // } else {
              // event[key] = element.querySelector(selector)?.getAttribute('data-src') ?? '';
              // event[key] = element.querySelector(selector)?.style['background-image'] ?? '';
              // event[key] = element.querySelector(selector) ?? '';
              // event[key] = getComputedStyle(element.querySelector(selector))?.backgroundImage ?? ''
              // event[key] = getComputedStyle(document.querySelector('.post').querySelector('.post-image-src'))?.backgroundImage ?? ''
              // }
              break
            default:
              if (selector) event[key] = element.querySelector(selector)?.innerText || ''
              else event[key] = ''
              break
          }
        }

        event.link = element.querySelector(selectors.link)?.href || ''

        if (Object.values(event).every(value => value === '')) continue

        events.push(event)
      }

      return events
    }, selectors)

    allEvents.push(...events)

    console.log(events);
  }

  await appendDataToFile(allEvents)

  let normalizedData = await normalizeData(allEvents)
  await browser.close()
}

// async function startParsing() {
//   await parseWebsites([
//     {
//       url: 'https://afisha.yandex.ru/saint-petersburg/selections/all-events-free',
//       selectors: {
//         eventList: '.event',
//         date: '.DetailsItem-fq4hbj-1',
//         place: '.PlaceLink-fq4hbj-2',
//         title: '.Title-fq4hbj-3',
//         description: '',
//         ageLimit: '',
//         image: '.jYbobS',
//         link: '.EventLink-sc-1x07jll-2',
//       },
//     },
//     {
//       url: 'https://kudago.com/spb/events/?date=2025-05-13&only_free=y',
//       selectors: {
//         eventList: '.post',
//         date: '.post-detail',
//         place: '.post-detail--event-place',
//         title: '.post-title-link',
//         description: '.post-description',
//         ageLimit: '.list-age-restriction-big',
//         image: '.post-image-src',
//         link: '.post-image-link',
//       }
//     }
//   ])
// }

let urlsWithSelectors = [
  {
    url: 'https://afisha.yandex.ru/saint-petersburg/selections/all-events-free',
    selectors: {
      eventList: '.event',
      date: '.DetailsItem-fq4hbj-1',
      place: '.PlaceLink-fq4hbj-2',
      title: '.Title-fq4hbj-3',
      description: '',
      ageLimit: '',
      image: '.jYbobS',
      link: '.EventLink-sc-1x07jll-2',
    },
  },
  {
    url: 'https://kudago.com/spb/events/?date=2025-05-13&only_free=y',
    selectors: {
      eventList: '.post',
      date: '.post-detail',
      place: '.post-detail--event-place',
      title: '.post-title-link',
      description: '.post-description',
      ageLimit: '.list-age-restriction-big',
      image: '.post-image-src',
      link: '.post-image-link',
    }
  }
]

parseWebsites(urlsWithSelectors)

let parseData = [
  {
    "date": "14 и 21 мая",
    "place": "Дом учёных им. М. Горького",
    "title": "Киносреда",
    "description": "",
    "ageLimit": "",
    "image": "https://avatars.mds.yandex.net/get-afishanew/23114/d318911409471f283109445602bdbe60/s380x220",
    "link": "https://afisha.yandex.ru/saint-petersburg/cinema_show/kinosreda-2023?source=rubric"
  },
  {
    "date": "до 18 мая",
    "place": "Севкабель Порт",
    "title": "Идеальные формы и живая реальность",
    "description": "",
    "ageLimit": "",
    "image": "https://avatars.mds.yandex.net/get-afishanew/5109582/f430c4d010747e74f50bbd97bc034104/s380x220",
    "link": "https://afisha.yandex.ru/saint-petersburg/art/idealnye-formy-i-zhivaia-realnost?source=rubric"
  },
  {
    "image": {
      "__ym_indexer": 1500
    },
    "date": "\nКруглый год",
    "place": "Станция метро «Чкаловская»",
    "title": "Аудиоэкскурсия «Блокада на Петроградской стороне с Софьей Лурье» ",
    "description": "Камерная экскурсия, которая оставит вас наедине с мыслями ленинградцев в осаждённом городе. Прогулка...",
    "ageLimit": "18+",
    "link": "https://kudago.com/spb/event/ekskursiya-audioekskursiya-blokada-na-petrogradskoj-storone-s-sofej-lure/"
  },
  {
    "image": {
      "swiperSlideSize": 365,
      "swiperSlideOffset": 0,
      "progress": 1,
      "dom7Listeners": {
        "webkitTransitionEnd": [],
        "transitionend": []
      }
    },
    "date": "\nКруглый год",
    "place": "Летний сад",
    "title": "Цветочная экскурсия по Петербургу ",
    "description": "ОТ ЛЕТНЕГО САДА ДО ЦВЕТОЧНОЙ ЛАВКИ НА ЧАЙКОВСКОГО. Прогулка длиной в пять километров откроет для вас множество удивительных фактов даже о знакомых местах. Вы...",
    "ageLimit": "0+",
    "link": "https://kudago.com/spb/event/ekskursiya-tsvetochnaya-ekskursiya-ot-lavki-zelenogorsk/"
  },
  {
    "image": {
      "swiperSlideSize": 365,
      "swiperSlideOffset": 0,
      "progress": 1
    },
    "date": "\n30 апреля – 25 мая весь день",
    "place": "",
    "title": "Открытие летнего туристического сезона в Петербурге ",
    "description": "В Санкт-Петербурге стартует новый туристический сезон. Рассказываем, какие события и мероприятия стоит...",
    "ageLimit": "6+",
    "link": "https://kudago.com/spb/event/otkryitie-letnego-turisticheskogo-sezona-v-peterburge/"
  },
  {
    "image": {
      "swiperSlideSize": 365,
      "swiperSlideOffset": 0,
      "progress": 1
    },
    "date": "\nКруглый год",
    "place": "Творческое пространство «Глобус»",
    "title": "Бесплатная йога в центре города",
    "description": "Отличный шанс для тех, кто давно хотел, но постоянно откладывал свои занятия по йоге. Организаторы...",
    "ageLimit": "",
    "link": "https://kudago.com/spb/event/raznoe-besplatnaya-joga-v-tsentre/"
  },
  {
    "image": {
      "swiperSlideSize": 365,
      "swiperSlideOffset": 0,
      "progress": 1,
      "dom7Listeners": {
        "webkitTransitionEnd": [],
        "transitionend": []
      }
    },
    "date": "\nКруглый год",
    "place": "Галерея Кустановича",
    "title": "Выставка живописи Дмитрия Кустановича ",
    "description": "В Галерее Кустановича в постоянном режиме работает выставка картин мастера пространственного реализма,...",
    "ageLimit": "0+",
    "link": "https://kudago.com/spb/event/vyistavka-zhivopis-dmitriya-kustanovicha-167863/"
  },
  {
    "image": {
      "__ym_indexer": 2494
    },
    "date": "\nКруглый год",
    "place": "Пышечная на Большой Конюшенной",
    "title": "Аудиоэкскурсия «Тепло Ленинграда» ",
    "description": "Бесплатная экскурсия, посвящённая культовому месту как Ленинграда, так и Петербурга, пышечной на Большой...",
    "ageLimit": "18+",
    "link": "https://kudago.com/spb/event/ekskursiya-teplo-leningrada/"
  },
  {
    "image": {
      "swiperSlideSize": 365,
      "swiperSlideOffset": 0,
      "progress": 1
    },
    "date": "\n27 января – 20 июня\nсмотреть расписание",
    "place": "Монумент героическим защитникам Ленинграда",
    "title": "Выставка «Твоим героям, Ленинград!» ",
    "description": "Выставка посвящена истории создания Монумента героическим защитникам Ленинграда. Экспозиция включает...",
    "ageLimit": "0+",
    "link": "https://kudago.com/spb/event/vyistavka-tvoim-geroyam-leningrad/"
  },
  {
    "image": {
      "__ym_indexer": 2692
    },
    "date": "\n19 мая 18:30",
    "place": "Открытая гостиная в Центральной библиотеке им. М. Ю. Лермонтова",
    "title": "Цикл лекций о кинодивах советского и российского кинематографа ",
    "description": "В Открытой гостиной Центральной библиотеки им. М. Ю. Лермонтова пройдут лекции, посвящённые отечественным...",
    "ageLimit": "18+",
    "link": "https://kudago.com/spb/event/kino-tsikl-lektsij-217123/"
  },
  {
    "image": {
      "__ym_indexer": 2843
    },
    "date": "\n12 мая 19:30",
    "place": "Книжный магазин «Порядок Слов»",
    "title": "Мастер-класс по сценарному мастерству ",
    "description": "Во время встречи гости узнают, как создавать ярких персонажей и увлекательные сюжеты вне зависимости от их опыта.",
    "ageLimit": "16+",
    "link": "https://kudago.com/spb/event/kino-master-klass/"
  },
  {
    "image": {
      "__ym_indexer": 2942
    },
    "date": "\nКруглый год",
    "place": "Музей истории НИИ экспериментальной медицины",
    "title": "Постоянная экспозиция Музея истории НИИ экспериментальной медицины",
    "description": "Настоящая кладезь биологических и медицинских знаний, накопленных научно-исследовательским ИЭМ.",
    "ageLimit": "",
    "link": "https://kudago.com/spb/event/ekspoziciya-muzeya-nii-eksperimentalnoy-mediciny/"
  },
  {
    "image": {
      "__ym_indexer": 3032
    },
    "date": "\nКруглый год",
    "place": "Музей кафедры патологической анатомии",
    "title": "Постоянная экспозиция Музея кафедры патологической анатомии ",
    "description": "Один из крупнейших музеев в Европе такого профиля — музей при Санкт-Петербургской Государственной Академии...",
    "ageLimit": "0+",
    "link": "https://kudago.com/spb/event/ekspoziciya-muzeya-kafedry-patologicheskoi-anatomi/"
  },
  {
    "image": {
      "__ym_indexer": 3125
    },
    "date": "\n1–31 мая 9:00–20:00",
    "place": "Библиотека имени Герцена",
    "title": "Выставка «Арт-калейдоскоп» ",
    "description": "На выставке Василия Бертельса «Арт-калейдоскоп» зрителей ждёт яркое визуальное путешествие по многолетнему...",
    "ageLimit": "6+",
    "link": "https://kudago.com/spb/event/vyistavka-art-kalejdoskop/"
  },
  {
    "image": {
      "__ym_indexer": 3224
    },
    "date": "\n22 апреля – 25 мая 9:00–20:00",
    "place": "Библиотека «Екатерингофская»",
    "title": "Выставка «Мадемуазель О» ",
    "description": "Выставка «Мадемуазель О» предлагает погрузиться в тонкую атмосферу детства, памяти и набоковской прозы....",
    "ageLimit": "0+",
    "link": "https://kudago.com/spb/event/vyistavka-mademuazel-o/"
  },
  {
    "image": {
      "__ym_indexer": 3323
    },
    "date": "\n3–31 мая\nсмотреть расписание",
    "place": "Библиотека им. К.А. Тимирязева",
    "title": "Выставка «Изнанка Яви» ",
    "description": "Фотопроект Анны Ардовой «Изнанка Яви» — это визуальный путь в глубины подсознания, где образы рождаются в...",
    "ageLimit": "6+",
    "link": "https://kudago.com/spb/event/vyistavka-iznanka-yavi/"
  },
  {
    "image": {
      "__ym_indexer": 3426
    },
    "date": "\n26 апреля – 15 мая 9:00–20:00",
    "place": "Библиотека «На Стремянной»",
    "title": "Выставка «Не забыты. Образы и судьбы солдат Великой Отечественной войны» ",
    "description": "Фотовыставка «Не забыты» — это проникновенный рассказ в фотографиях о судьбах солдат Великой Отечественной...",
    "ageLimit": "0+",
    "link": "https://kudago.com/spb/event/vyistavka-ne-zabyityi-obrazyi-i-sudbyi-soldat-velikoj-otechestvennoj-vojnyi/"
  },
  {
    "image": {
      "__ym_indexer": 3525
    },
    "date": "\n3–31 мая 9:00–20:00",
    "place": "Библиотека им. К.А. Тимирязева",
    "title": "Выставка «Эстезис Обводного канала» ",
    "description": "Фотовыставка «Эстезис Обводного канала» — это философский взгляд на индустриальный Петербург. В кадрах...",
    "ageLimit": "6+",
    "link": "https://kudago.com/spb/event/vyistavka-estezis-obvodnogo-kanala/"
  },
  {
    "image": {
      "__ym_indexer": 3766
    },
    "date": "\nКруглый год",
    "place": "Аэропорт Пулково",
    "title": "Проект I Believe in Angels Дмитрия Шорина ",
    "description": "В новом терминале аэропорта «Пулково» расположились четыре скульптуры из совместного проекта Эрарты и...",
    "ageLimit": "0+",
    "link": "https://kudago.com/spb/event/proekt-i-believe-angels/"
  },
  {
    "image": {
      "__ym_indexer": 3860
    },
    "date": "\n5–31 мая 9:00–20:00",
    "place": "Библиотека «Семёновская»",
    "title": "Выставка «Плакаты Победы» ",
    "description": "Агитационный плакат времён Великой Отечественной войны — это голос эпохи.",
    "ageLimit": "6+",
    "link": "https://kudago.com/spb/event/vyistavka-plakatyi-pobedyi/"
  },
  {
    "image": {
      "__ym_indexer": 3959
    },
    "date": "\n12 мая 15:00–16:30",
    "place": "Центральная библиотека имени Лермонтова",
    "title": "Лекция «Петергофская дорога. Двадцатый век начинается» ",
    "description": "Петергофская дорога — одна из старейших и самых узнаваемых магистралей города. Её история — это не просто...",
    "ageLimit": "12+",
    "link": "https://kudago.com/spb/event/lektsiya-petergofskaya-doroga-dvadtsatyij-vek-nachinaetsya/"
  },
  {
    "image": {
      "__ym_indexer": 4058
    },
    "date": "\n29 апреля – 15 мая 12:00–20:00",
    "place": "Библиотека имени Аркадия Гайдара",
    "title": "Выставка «О чём писали газеты в 1945 году» ",
    "description": "Выставка «О чём писали газеты в 1945 году» переносит зрителей в атмосферу военных лет. Оригинальные...",
    "ageLimit": "12+",
    "link": "https://kudago.com/spb/event/vyistavka-o-chyom-pisali-gazetyi-v-1945-godu/"
  },
  {
    "image": {
      "__ym_indexer": 4156
    },
    "date": "\n12 мая 18:00–19:00",
    "place": "Библиотека имени Маяковского в «Севкабель Порту»",
    "title": "Мастер-класс «Коллажный трип. Финляндия» ",
    "description": "Коллажный трип — это творческое путешествие сквозь образы и стили. Очередная остановка — Финляндия, страна...",
    "ageLimit": "18+",
    "link": "https://kudago.com/spb/event/master-klass-kollazhnyij-trip-finlyandiya/"
  },
  {
    "image": {
      "__ym_indexer": 4254
    },
    "date": "\n12 мая 18:00–19:30",
    "place": "Центральная библиотека имени Лермонтова",
    "title": "Концерт «Любимое: арии и сцены из опер» ",
    "description": "Погрузитесь в мир оперной музыки вместе с солистами петербургских театров.",
    "ageLimit": "12+",
    "link": "https://kudago.com/spb/event/kontsert-lyubimoe-arii-i-stsenyi-iz-oper/"
  },
  {
    "image": {
      "__ym_indexer": 4353
    },
    "date": "\n12 мая 15:00–16:30",
    "place": "Центральная библиотека имени Лермонтова",
    "title": "Мастер-класс по оригами ",
    "description": "Искусство оригами — это медитативный процесс, раскрывающий внутренние ресурсы человека. На мастер-классе...",
    "ageLimit": "12+",
    "link": "https://kudago.com/spb/event/master-klass-master-klass-po-origami/"
  },
  {
    "image": {
      "__ym_indexer": 4452
    },
    "date": "\n3–31 мая 9:00–20:00",
    "place": "Библиотека «Семёновская»",
    "title": "Выставка «Великая Отечественная» ",
    "description": "Книжная выставка в библиотеке «Семёновская» помогает взглянуть на знакомую военную прозу по-новому.",
    "ageLimit": "6+",
    "link": "https://kudago.com/spb/event/vyistavka-velikaya-otechestvennaya/"
  },
  {
    "image": {
      "__ym_indexer": 4551
    },
    "date": "\n12 мая 17:00–18:30",
    "place": "Библиотека имени В.И.Ленина",
    "title": "Мастер-класс «Хаос=порядок» ",
    "description": "Коллаж — это не просто техника, а язык, на котором можно говорить с миром. Мастер-класс «Хаос=порядок»...",
    "ageLimit": "16+",
    "link": "https://kudago.com/spb/event/master-klass-haosporyadok/"
  },
  {
    "image": {
      "__ym_indexer": 4649
    },
    "date": "\n12 мая 18:30–20:00",
    "place": "Центральная библиотека имени Лермонтова",
    "title": "Лекция «Дивы оттепельного и застойного кино» ",
    "description": "Какими были дивы советского кино? Они были не просто красивыми — они формировали взгляды, идеалы и эмоции...",
    "ageLimit": "18+",
    "link": "https://kudago.com/spb/event/lektsiya-divyi-ottepelnogo-i-zastojnogo-kino/"
  }
]

// normalizeData(parseData)


// database.js

import { renderAllEventCards } from "./EventCard.js";

let db;

function initDatabase() {
  const request = indexedDB.open("EventsDB", 1);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;

    const usersStore = db.createObjectStore("Users", { keyPath: "user_id", autoIncrement: true });
    usersStore.createIndex("email", "email", { unique: true });

    const eventsStore = db.createObjectStore("Events", { keyPath: "event_id", autoIncrement: true });
    eventsStore.createIndex("date", "date");
    eventsStore.createIndex("place", "place");
    eventsStore.createIndex("name", "name");
    eventsStore.createIndex("description", "description");
    eventsStore.createIndex("photo", "photo");
    eventsStore.createIndex("time_start", "time_start");
    eventsStore.createIndex("time_end", "time_end");
    eventsStore.createIndex("organizer_id", "organizer_id");
    eventsStore.createIndex("is_organizer", "is_organizer");
    eventsStore.createIndex("category", "category");
    eventsStore.createIndex("is_child_friendly", "is_child_friendly");
    eventsStore.createIndex("additional_comment", "additional_comment");
    eventsStore.createIndex("rating", "rating");
    eventsStore.createIndex("user_id", "user_id");

    const reviewsStore = db.createObjectStore("Reviews", { keyPath: "review_id", autoIncrement: true });
    reviewsStore.createIndex("user_id", "user_id");
    reviewsStore.createIndex("event_id", "event_id");
    reviewsStore.createIndex("rating", "rating");
    reviewsStore.createIndex("comment", "comment");
    reviewsStore.createIndex("created_at", "created_at");

    const notificationsStore = db.createObjectStore("Notifications", { keyPath: "notification_id", autoIncrement: true });
    notificationsStore.createIndex("user_id", "user_id");
    notificationsStore.createIndex("event_id", "event_id");
    notificationsStore.createIndex("message", "message");
    notificationsStore.createIndex("is_read", "is_read");
    notificationsStore.createIndex("created_at", "created_at");

    const favoritesStore = db.createObjectStore("Favorites", { keyPath: "favorite_id", autoIncrement: true });
    favoritesStore.createIndex("user_id", "user_id");
    favoritesStore.createIndex("event_id", "event_id");

    const subscriptionsStore = db.createObjectStore("Subscriptions", { keyPath: "subscription_id", autoIncrement: true });
    subscriptionsStore.createIndex("user_id", "user_id");
    subscriptionsStore.createIndex("organizer_id", "organizer_id");
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    console.log("База данных успешно создана или открыта:", db);

    // deleteEvents()
    // addAllEvents(defaultEvents)

    getEvents()
      .then(events => {
        renderAllEventCards(events);
      })
      .catch(error => {
        console.error('Ошибка при получении событий:', error);
      });

    // readEvents()
  };

  request.onerror = function (event) {
    console.error("Ошибка при открытии базы данных:", event.target.error);
  };
}

function addEvent(eventData) {
  const transaction = db.transaction(['Events'], 'readwrite')
  const eventsStore = transaction.objectStore('Events')
  const request = eventsStore.add(eventData)

  request.onsuccess = () => {
    console.log('Мероприятие было добавлено в базу данных');
  }

  request.onerror = (event) => {
    console.error('Ошибка при добавлении мероприятии', event.target.error)
  }
}

function addAllEvents(eventsData) {
  eventsData.forEach(eventData => {
    addEvent(eventData)
  });
}

function getEvents() {
  return new Promise((resolve, reject) => {
    const request = db.transaction('Events')
      .objectStore('Events')
      .getAll();

    request.onsuccess = () => {
      const events = request.result;
      resolve(events);
    };

    request.onerror = (event) => {
      console.error('Ошибка при получении мероприятий:', event.target.error);
      reject(event.target.error);
    };
  });
}

function readEvents() {
  const transaction = db.transaction(["Events"]);
  const objectStore = transaction.objectStore("Events");
  const request = objectStore.openCursor();

  request.onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      console.log(`ID: ${cursor.key}, Название: ${cursor.value.name}, Описание: ${cursor.value.description}`);
      cursor.continue();
    } else {
      console.log("Все мероприятия прочитаны.");
    }
  };
}

function deleteEvents() {
  const request = db.transaction(["Events"], "readwrite")
    .objectStore("Events")
    // .delete(id)
    .clear()

  request.onsuccess = () => {
    console.log("Мероприятие удалено.");
  };

  request.onerror = (event) => {
    console.error('Ошибка при удалении мероприятий:', event.target.error)
  }
}

let defaultEvents = [
  {
    "date": "2025-05-23",
    "address": "petrogradsky",
    "image": "images/event/event-1.jpg",
    "name": "Выступление уличных фокусников",
    "description": "Это настоящее шоу. Пристёгивайте ремни и присоединяйтесь!",
    "time_start": "",
    "time_end": "",
    "organizer_id": "1",
    "is_organizer": "on",
    "category": "perfomance",
    "is_child_friendly": "off",
    "comment": ""
  },
  {
    "date": "2025-05-24",
    "address": "vasileostrovsky",
    "image": "images/event/event-2.jpg",
    "name": "Художественный мастер-класс от Смешариков",
    "description": "Идеально для похода всей семьёй. Ждём Вас!",
    "time_start": "",
    "time_end": "",
    "organizer_id": "1",
    "is_organizer": "on",
    "category": "master-class",
    "is_child_friendly": "on",
    "comment": ""
  },
  {
    "date": "2025-05-25",
    "address": "petrogradsky",
    "image": "images/event/event-3.png",
    "name": "Лекция о истории русского кинематографа",
    "description": "Вы точно узнаете что-то новое! Приходите!",
    "time_start": "",
    "time_end": "",
    "organizer_id": "1",
    "is_organizer": "on",
    "category": "lecture",
    "is_child_friendly": "off",
    "comment": ""
  },
  {
    "date": "2025-05-29",
    "address": "admiralteysky",
    "image": "images/event/event-4.jpg",
    "name": "Совместные чтения в Подписных изданиях",
    "description": "Вы точно узнаете что-то новое! Приходите!",
    "time_start": "",
    "time_end": "",
    "organizer_id": "1",
    "is_organizer": "on",
    "category": "lecture",
    "is_child_friendly": "off",
    "comment": ""
  },
  {
    "date": "2025-05-30",
    "address": "admiralteysky",
    "image": "images/event/event-5.jpg",
    "name": "Фестиваль водных фонариков",
    "description": "Идеально для похода всей семьёй. Ждём Вас!",
    "time_start": "",
    "time_end": "",
    "organizer_id": "unknown",
    "is_organizer": "off",
    "category": "festival",
    "is_child_friendly": "on",
    "comment": ""
  },
  {
    "date": "2025-06-01",
    "address": "vasileostrovsky",
    "image": "images/event/event-6.jpg",
    "name": "Поющие мосты",
    "description": "Это настоящее шоу. Пристёгивайте ремни и присоединяйтесь!",
    "time_start": "",
    "time_end": "",
    "organizer_id": "unknown",
    "is_organizer": "off",
    "category": "perfomance",
    "is_child_friendly": "on",
    "comment": ""
  }
]

export { initDatabase, addAllEvents, addEvent, getEvents }

import { initDatabase, addAllEvents, getEvents } from './Database.js';
// import { parseWebsites } from './Parse.js';
import { renderAllEventCards } from './EventCard.js';

async function main() {
  await initDatabase();

  const defaultEvents = [
    {
      "date": "2025-05-23",
      "address": "petrogradsky",
      "image": "images/event/event-1.jpg",
      "name": "Выступление уличных фокусников",
      "description": "Это настоящее шоу. Пристёгивайте ремни и присоединяйтесь!",
      "time_start": "16:00",
      "time_end": "17:00",
      "organizer_id": "1",
      "is_organizer": "on",
      "category": "perfomance",
      "is_child_friendly": "off",
      "comment": ""
    },
    {
      "date": "2025-05-24",
      "address": "vasileostrovsky",
      "image": "images/event/event-2.jpg",
      "name": "Художественный мастер-класс от Смешариков",
      "description": "Идеально для похода всей семьёй. Ждём Вас!",
      "time_start": "10:00",
      "time_end": "12:00",
      "organizer_id": "1",
      "is_organizer": "on",
      "category": "master-class",
      "is_child_friendly": "on",
      "comment": ""
    },
    {
      "date": "2025-05-25",
      "address": "petrogradsky",
      "image": "images/event/event-3.png",
      "name": "Лекция о истории русского кинематографа",
      "description": "Вы точно узнаете что-то новое! Приходите!",
      "time_start": "14:00",
      "time_end": "16:00",
      "organizer_id": "1",
      "is_organizer": "on",
      "category": "lecture",
      "is_child_friendly": "off",
      "comment": ""
    },
    {
      "date": "2025-05-29",
      "address": "admiralteysky",
      "image": "images/event/event-4.jpg",
      "name": "Совместные чтения в Подписных изданиях",
      "description": "Вы точно узнаете что-то новое! Приходите!",
      "time_start": "16:00",
      "time_end": "18:00",
      "organizer_id": "1",
      "is_organizer": "on",
      "category": "lecture",
      "is_child_friendly": "off",
      "comment": ""
    },
    {
      "date": "2025-05-30",
      "address": "admiralteysky",
      "image": "images/event/event-5.jpg",
      "name": "Фестиваль водных фонариков",
      "description": "Идеально для похода всей семьёй. Ждём Вас!",
      "time_start": "19:00",
      "time_end": "21:00",
      "organizer_id": "unknown",
      "is_organizer": "off",
      "category": "festival",
      "is_child_friendly": "on",
      "comment": ""
    },
    {
      "date": "2025-06-01",
      "address": "vasileostrovsky",
      "image": "images/event/event-6.jpg",
      "name": "Поющие мосты",
      "description": "Это настоящее шоу. Пристёгивайте ремни и присоединяйтесь!",
      "time_start": "00:00",
      "time_end": "01:00",
      "organizer_id": "unknown",
      "is_organizer": "off",
      "category": "perfomance",
      "is_child_friendly": "on",
      "comment": ""
    }
  ]

  addAllEvents(defaultEvents);

  const urlsWithSelectors = [
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
      url: 'https://kudago.com/spb/events/?date=2025-05-14&only_free=y',
      selectors: {
        eventList: '.post',
        date: '.post-detail',
        place: '.post-detail--event-place',
        title: '.post-title-link',
        description: '.post-description',
        ageLimit: '.list-age-restriction-big',
        image: '.post-image-src',
        link: '.post-image-link',
      }
    }
  ];

  const parsedEvents = await parseWebsites(urlsWithSelectors);
  

  addAllEvents(parsedEvents);

  const events = await getEvents();
  renderAllEventCards(events);
}

main();

// AddEventForm.js

import { addEvent, getEvents } from "./Database.js"
import { renderAllEventCards } from "./EventCard.js"

export default function handleFormSubmit() {
  let addEventForm = document.querySelector('.add-event__form')

  addEventForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
    console.log(data)

    addEvent(data)

    window.location.href = 'index.html'

    const eventsList = document.querySelector('.events__list');
    let eventCard = renderEventCard(eventData)
    eventsList.appendChild(eventCard)
  })
}

// export { handleFormSubmit }