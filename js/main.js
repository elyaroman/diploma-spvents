import handleFormSubmit from './addEventForm.js'
import { initDatabase, addAllEvents, getEvents } from './Database.js'
// import { parseWebsites } from './Parse.js'
import { renderAllEventCards } from './EventCard.js'
import { setupFilters, applyFilters } from './filterSort.js'

async function main() {
  await initDatabase()

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

  // addAllEvents(defaultEvents)

  // const urlsWithSelectors = [
  //   {
  //     url: 'https://afisha.yandex.ru/saint-petersburg/selections/all-events-free',
  //     selectors: {
  //       eventList: '.event',
  //       date: '.DetailsItem-fq4hbj-1',
  //       place: '.PlaceLink-fq4hbj-2',
  //       name: '.Title-fq4hbj-3',
  //       description: '',
  //       ageLimit: '',
  //       image: '.jYbobS',
  //       link: '.EventLink-sc-1x07jll-2',
  //     },
  //   },
  //   {
  //     url: 'https://kudago.com/spb/events/?date=2025-05-14&only_free=y',
  //     selectors: {
  //       eventList: '.post',
  //       date: '.post-detail',
  //       place: '.post-detail--event-place',
  //       title: '.post-title-link',
  //       description: '.post-description',
  //       ageLimit: '.list-age-restriction-big',
  //       image: '.post-image-src',
  //       link: '.post-image-link',
  //     }
  //   }
  // ]

  // const parsedEvents = await parseWebsites(urlsWithSelectors)

  const parsedEvents = [
    {
      date: 'завтра 21 мая,',
      place: 'Дом учёных им. М. Горького',
      name: 'Киносреда',
      description: '',
      image: 'https://avatars.mds.yandex.net/get-afishanew/23114/d318911409471f283109445602bdbe60/s380x220',
      link: 'https://afisha.yandex.ru/saint-petersburg/cinema_show/kinosreda-2023?source=rubric',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '18:00',
      time_end: '18:00'
    },
    {
      date: '2025-05-20',
      place: 'Станция метро «Чкаловская»',
      name: 'Аудиоэкскурсия «Блокада на Петроградской стороне с Софьей Лурье» ',
      description: 'Камерная экскурсия, которая оставит вас наедине с мыслями ленинградцев в осаждённом городе. Прогулка...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/ekskursiya-audioekskursiya-blokada-na-petrogradskoj-storone-s-sofej-lure/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'off',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Летний сад',
      name: 'Цветочная экскурсия по Петербургу ',
      description: 'ОТ ЛЕТНЕГО САДА ДО ЦВЕТОЧНОЙ ЛАВКИ НА ЧАЙКОВСКОГО. Прогулка длиной в пять километров откроет для вас множество удивительных фактов даже о знакомых местах. Вы...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/ekskursiya-tsvetochnaya-ekskursiya-ot-lavki-zelenogorsk/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: '',
      name: 'Открытие летнего туристического сезона в Петербурге ',
      description: 'В Санкт-Петербурге стартует новый туристический сезон. Рассказываем, какие события и мероприятия стоит...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/otkryitie-letnego-turisticheskogo-sezona-v-peterburge/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Художественная студия Artista на Некрасова',
      name: 'Бесплатная выставка живописи художников Ивана и Натальи Тупейко «Два взгляда» ',
      description: 'В художественной студии Artista проходит выставка полотен семьи петербургских живописцев — Ивана и Натальи...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-dva-vzglyada/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Творческое пространство «Глобус»',
      name: 'Бесплатная йога в центре города',
      description: 'Отличный шанс для тех, кто давно хотел, но постоянно откладывал свои занятия по йоге. Организаторы...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/raznoe-besplatnaya-joga-v-tsentre/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Подростково-молодёжный клуб «Ровесник»',
      name: 'Бесплатные занятия изобразительным искусством и дизайном ',
      description: 'Освоить техники изобразительного искусства от рисования карандашом до конструирования из бумаги можно на...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/detyam-zanyatiya-izobrazitelnyim-iskusstvom/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Галерея Кустановича',
      name: 'Выставка живописи Дмитрия Кустановича ',
      description: 'В Галерее Кустановича в постоянном режиме работает выставка картин мастера пространственного реализма,...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-zhivopis-dmitriya-kustanovicha-167863/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Пышечная на Большой Конюшенной',
      name: 'Аудиоэкскурсия «Тепло Ленинграда» ',
      description: 'Бесплатная экскурсия, посвящённая культовому месту как Ленинграда, так и Петербурга, пышечной на Большой...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/ekskursiya-teplo-leningrada/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'off',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Монумент героическим защитникам Ленинграда',
      name: 'Выставка «Твоим героям, Ленинград!» ',
      description: 'Выставка посвящена истории создания Монумента героическим защитникам Ленинграда. Экспозиция включает...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-tvoim-geroyam-leningrad/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Музей Анны Ахматовой в Фонтанном доме',
      name: 'Постоянная экспозиция Музея Анны Ахматовой «Иосиф Бродский. „Сохрани мою тень“» ',
      description: 'На стене Фонтанного дома проступили «следы» Иосифа Бродского.',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-iosif-brodskij-sohrani-moyu-ten/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Музей истории НИИ экспериментальной медицины',
      name: 'Постоянная экспозиция Музея истории НИИ экспериментальной медицины',
      description: 'Настоящая кладезь биологических и медицинских знаний, накопленных научно-исследовательским ИЭМ.',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/ekspoziciya-muzeya-nii-eksperimentalnoy-mediciny/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Музей кафедры патологической анатомии',
      name: 'Постоянная экспозиция Музея кафедры патологической анатомии ',
      description: 'Один из крупнейших музеев в Европе такого профиля — музей при Санкт-Петербургской Государственной Академии...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/ekspoziciya-muzeya-kafedry-patologicheskoi-anatomi/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека им. К.А. Тимирязева',
      name: 'Выставка «Изнанка Яви» ',
      description: 'Фотопроект Анны Ардовой «Изнанка Яви» — это визуальный путь в глубины подсознания, где образы рождаются в...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-iznanka-yavi/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '\n20 мая \n24 июня 17:00',
      place: 'Библиотека «Бронницкая»',
      name: 'Книжный клуб с психологом ',
      description: 'Книжный клуб с психологом в библиотеке Бронницкая — это место для глубокого анализа литературы и...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/knizhnyij-klub-s-psihologom/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '17:00',
      time_end: '17:00'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека «Екатерингофская»',
      name: 'Выставка «Мадемуазель О» ',
      description: 'Выставка «Мадемуазель О» предлагает погрузиться в тонкую атмосферу детства, памяти и набоковской прозы....',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-mademuazel-o/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека им. К.А. Тимирязева',
      name: 'Выставка «Эстезис Обводного канала» ',
      description: 'Фотовыставка «Эстезис Обводного канала» — это философский взгляд на индустриальный Петербург. В кадрах...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-estezis-obvodnogo-kanala/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Аэропорт Пулково',
      name: 'Проект I Believe in Angels Дмитрия Шорина ',
      description: 'В новом терминале аэропорта «Пулково» расположились четыре скульптуры из совместного проекта Эрарты и...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/proekt-i-believe-angels/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека имени Герцена',
      name: 'Выставка «Арт-калейдоскоп» ',
      description: 'На выставке Василия Бертельса «Арт-калейдоскоп» зрителей ждёт яркое визуальное путешествие по многолетнему...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-art-kalejdoskop/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека «Семёновская»',
      name: 'Творческий вечер «„Маленький принц“: слово и саксофон» ',
      description: 'Музыкально-литературный вечер по мотивам «Маленького принца» объединит голос, саксофон и философию.',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/tvorcheskij-vecher-malenkij-prints-slovo-i-saksofon-deld9o/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека «Семёновская»',
      name: 'Выставка «Плакаты Победы» ',
      description: 'Агитационный плакат времён Великой Отечественной войны — это голос эпохи.',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-plakatyi-pobedyi/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотечный Центр Общения «Современник»',
      name: 'Лекция «Россия в рэпе: репрезентация российских городов в творчестве рэперов» ',
      description: 'Культуролог Анастасия Лукьянова расскажет о том, как рэп отражает дух российских городов. Слушателей ждёт...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/lektsiya-rossiya-v-repe-reprezentatsiya-rossijskih-gorodov-v-tvorchestve-reperov-cvqpkd/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'off',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека «Измайловская»',
      name: 'Лекция «Родственники по ДНК. Заблуждения и факты о генетических тестах» ',
      description: 'Генетические тесты сегодня — это ключ к семейным тайнам и научному самопознанию. ДНК помогает находить...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/lektsiya-rodstvenniki-po-dnk-zabluzhdeniya-i-faktyi-o-geneticheskih-testah/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '\n21 мая \n22 мая 10:00\n23 мая 10:00\nвсе даты',
      place: 'Библиотека на Карповке',
      name: 'Пешеходный квест «Арктический квест» ',
      description: 'Познакомьтесь с интересными фактами об учёных и капитанах, оставивших след в изучении Арктики.',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/peshehodnyij-kvest-arkticheskij-kvest/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '10:00',
      time_end: '10:00'
    },
    {
      date: '\n20 мая',
      place: 'Детская библиотека имени Михаила Лермонтова',
      name: 'Мастер-класс «Лепота» ',
      description: 'В Детской библиотеке имени Лермонтова состоится мастер-класс по лепке «Лепота».',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/detyam-lepota/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '17:00',
      time_end: '17:00'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека друзей',
      name: 'Лекция «Воздушные ворота Ленинграда. История строительства аэровокзальных комплексов» ',
      description: 'Погрузитесь в удивительную историю главного аэропорта города и откройте для себя неизвестные страницы его создания.',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/lektsiya-vozdushnyie-vorota-leningrada-istoriya-stroitelstva-aerovokzalnyih-kompleksov-8agqe7/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека на Карповке',
      name: 'Встреча «Александр Суворов» ',
      description: 'На этой встрече оживут страницы истории: потомки легендарного полководца поделятся историями, семейными...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vstrecha-aleksandr-suvorov/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека им. А.С. Грибоедова',
      name: 'Творческий вечер «Здравствуй, муза, хочешь финик?» ',
      description: 'Погрузитесь в атмосферу тонкой иронии и задушевной лирики Саши Чёрного на музыкально-поэтическом вечере.',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/tvorcheskij-vecher-zdravstvuj-muza-hochesh-finik/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '\n20 мая \n3 июня 19:00\n17 июня 19:00',
      place: 'Библиотека имени Маяковского в «Севкабель Порту»',
      name: 'Встреча читательского клуба на английском языке ',
      description: 'Участники читательского клуба обсудят рассказ Сомерсета Моэма на английском языке.',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vstrecha-chitatelskij-klub-na-anglijskom-yazyike/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'off',
      time_start: '19:00',
      time_end: '19:00'
    },
    {
      date: '\n20 мая',
      place: 'Библиотека «Музей книги блокадного города»',
      name: 'Лекция «Гордость земли Донской» ',
      description: 'Увлекательная лекция о жизни и творчестве Михаила Шолохова откроет малоизвестные факты из биографии...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/lektsiya-gordost-zemli-donskoj/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '18:00',
      time_end: '18:00'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека «Точки Зрения»',
      name: 'Лекция «Развитие гравюры и книжная графика XVII–XIX вв.» ',
      description: 'Как изображение стало неотъемлемой частью книги? Лекция откроет тайны гравюры XVII–XIX веков, её связь с...',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/lektsiya-razvitie-gravyuryi-i-knizhnaya-grafika-xvii-xix-vv/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    },
    {
      date: '2025-05-20',
      place: 'Библиотека «Семёновская»',
      name: 'Выставка «Великая Отечественная» ',
      description: 'Книжная выставка в библиотеке «Семёновская» помогает взглянуть на знакомую военную прозу по-новому.',
      image: 'images/event/event-default.jpg',
      link: 'https://kudago.com/spb/event/vyistavka-velikaya-otechestvennaya/',
      organizer: 'unknown',
      category: 'another',
      is_child_friendly: 'on',
      time_start: '00:00',
      time_end: '23:59'
    }
  ]

  // addAllEvents(parsedEvents);

  const events = await getEvents()
  if (document.URL.includes('index.html')) {
    renderAllEventCards(events)
    setupFilters()
  }

  handleFormSubmit()
}

main()