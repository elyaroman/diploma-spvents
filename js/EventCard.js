function renderEventCard(eventData) {
  const eventCard = document.createElement('li');
  eventCard.classList.add('events__item');

  let eventDate = convertDate(eventData.date)

  eventCard.innerHTML = `
    <a class="event-card" href="${eventData.link}">
      <div class="event-card__pic">
        <img class="event-card__img" src="${eventData.image}" alt="${eventData.name}" width="340" height="200" loading="lazy">
      </div>
      <div class="event-card__info">
        <div class="event-card__description">
          <span class="event-card__date">
            ${eventDate.month}
            <span class="event-card__date-number">${eventDate.day}</span>
          </span>
          <h3 class="event-card__name">${eventData.name}</h3>
        </div>
        <p class="event-card__text">${eventData.description}</p>
      </div>
    </a>
  `;

  return eventCard
};

function renderAllEventCards(eventsData) {
  const eventsList = document.querySelector('.events__list');
  eventsList.innerHTML = ''

  eventsData.forEach(eventData => {
    let eventCard = renderEventCard(eventData)
    eventsList.appendChild(eventCard)
  });
}

function convertDate(date) {
  let months = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"]
  let tempDate = date.split("-");
  let day = tempDate[2]
  let month = months[Number(tempDate[1]) - 1]
  return { day, month }
}

export { renderAllEventCards, renderEventCard }