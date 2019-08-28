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

const renderEvents = (container, eventsToRender) => {
  events.sort((a, b) => {
    if (a.dateTime.dateStart < b.dateTime.dateStart) {
      return -1;
    }
    if (a.dateTime.dateStart > b.dateTime.dateStart) {
      return 1;
    }
    return 0;
  });

  const renderEventsList = (eventsToList) => {
    let eventsArray = [];
    eventsToList.forEach((event) => eventsArray.push(renderEvent(event)));
    return eventsArray.join(``);
  };

  const renderElements = (eventToForm, eventsToList) => {
    container.insertAdjacentHTML(`beforeend`, renderEventForm(eventToForm));
    container.insertAdjacentHTML(`beforeend`, renderEventsList(eventsToList));
  };

  renderElements(eventsToRender[0], eventsToRender.slice(1, eventsToRender.length));
};

const countTripCost = (eventsToSum) => {
  let cost = 0;
  for (const event of eventsToSum) {
    cost = cost + event.price;
  }
  return Math.floor(cost);
  // TODO: count offers price also
};

render(tripMenuTitle, renderMenu(menuTabs), `afterend`);
render(tripControls, renderFilter(filterOptions), `beforeend`);

renderEvents(tripEvents, events);
render(tripInfo, renderTripInfo(getTripInfo(events)), `afterbegin`);
tripCost.innerHTML = countTripCost(events);
