import { getEvents } from './Database.js'
import { renderAllEventCards } from './EventCard.js'

function getTimePeriodRange(period) {
  switch (period) {
    case 'night': return [0, 6]
    case 'morning': return [6, 12]
    case 'afternoon': return [12, 18]
    case 'evening': return [18, 24]
    default: return [0, 24]
  }
}

function getDayType(dateStr) {
  const date = new Date(dateStr)
  const day = date.getDay() 

  if (day === 5) return 'friday'
  if (day === 0 || day === 6) return 'weekends'
  return 'weekdays'
}

function filterEvents(events, filters) {
  return events.filter(event => {
    const nameMatch = event.name.toLowerCase().includes(filters.name.toLowerCase())
    const districtMatch = filters.district === '' || event.address === filters.district

    const [startHour] = event.time_start.split(':').map(Number)
    const [minTime, maxTime] = getTimePeriodRange(filters.time)
    const timeMatch = filters.time === '' || (startHour >= minTime && startHour < maxTime)

    const dayType = getDayType(event.date)
    const dayMatch = filters.day === '' || filters.day === dayType

    const typeMatch = filters.type === '' || event.category === filters.type

    const childMatch =
      filters.child === '' ||
      (filters.child === 'child_friendly' && event.is_child_friendly === 'on') ||
      (filters.child === 'child_unfriendly' && event.is_child_friendly === 'off')

    return nameMatch && districtMatch && timeMatch && dayMatch && typeMatch && childMatch
  })
}

function setupFilters() {
  const nameInput = document.querySelector('#events-name')
  const districtSelect = document.querySelector('#events-district')
  const timeSelect = document.querySelector('#events-time')
  const daySelect = document.querySelector('#events-date')
  const typeSelect = document.querySelector('#events-category')
  const childSelect = document.querySelector('#events-child-friendly')

  const filterControls = [
    nameInput,
    districtSelect,
    timeSelect,
    daySelect,
    typeSelect,
    childSelect
  ]

  filterControls.forEach(control => {
    control.addEventListener('input', applyFilters)
  })
}

async function applyFilters() {
  const events = await getEvents()

  const filters = {
    name: document.querySelector('#events-name').value.trim(),
    district: document.querySelector('#events-district').value,
    time: document.querySelector('#events-time').value,
    day: document.querySelector('#events-date').value,
    type: document.querySelector('#events-category').value,
    child: document.querySelector('#events-child-friendly').value,
  }

  const filtered = filterEvents(events, filters)
  renderAllEventCards(filtered)
}

export { setupFilters, applyFilters }
