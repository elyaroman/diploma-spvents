import { addEvent, getEvents } from "./Database.js"
import { renderAllEventCards } from "./EventCard.js"

export default function handleFormSubmit() {
  if (document.URL.includes('add-event.html')) {
    let addEventForm = document.querySelector('.add-event__form');

    addEventForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(event.target);
      const data = Object.fromEntries(formData.entries());
      data.image = 'images/event/event-default.jpg'

      await addEvent(data);

      const updatedEvents = await getEvents();

      addEventForm.reset();

      window.location.href = 'index.html';

      const eventsList = document.querySelector('.events__list');
      eventsList.innerHTML = '';
      renderAllEventCards(updatedEvents);
    });
  }
}
