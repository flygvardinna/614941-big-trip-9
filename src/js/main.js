import {getEvent, menuTabs, filterOptions, getTripInfo} from './data.js';
import {renderMenu} from './components/menu.js';
import {renderFilter} from './components/filter.js';
import {renderEvent} from './components/event.js';
import {renderEventForm} from './components/event-form.js';
import {renderTripInfo} from './components/trip-info.js';

const EVENTS_COUNT = 4;
const events = [...Array(EVENTS_COUNT)].map(() => getEvent());

const tripInfo = document.querySelector(`.trip-info`);
const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);
const tripEvents = document.querySelector(`.trip-events`);
const tripCost = tripInfo.querySelector(`.trip-info__cost-value`);

const render = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};

const renderEvents = (container, events) => {
  events.sort((a,b) => (a.dateStart > b.dateStart) ? 1 : ((b.dateStart > a.dateStart) ? -1 : 0));

  const renderEventsList = eventsToList => {
    let eventsToRender = [];
    eventsToList.forEach(event => eventsToRender.push(renderEvent(event)));
    return eventsToRender.join(``);
  };

  const renderElements = (eventToForm, eventsToList) => {
    container.insertAdjacentHTML(`beforeend`, renderEventForm(eventToForm));
    container.insertAdjacentHTML(`beforeend`, renderEventsList(eventsToList));
  };

  renderElements(events[0], events.slice(1, events.length));
};

const countTripCost = events => {
  let tripCost = 0;
  let offersTotal = 0;
  for (const event of events) {
    if (event.offers.length > 0) {
      for (const offer of event.offers) {
        if (offer.selected) {
          offersTotal = offersTotal + offer.price;
        }
      }
    }
    tripCost = tripCost + event.price;
  }
  return Math.floor(tripCost + offersTotal);
};

console.log(events);

render(tripMenuTitle, renderMenu(menuTabs), `afterend`);
render(tripControls, renderFilter(filterOptions), `beforeend`);

renderEvents(tripEvents, events);
render(tripInfo, renderTripInfo(getTripInfo(events)), `afterbegin`);
tripCost.innerHTML = countTripCost(events);
