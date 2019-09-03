import {Position, createElement, render, unrender} from './utils.js';
import {getEvent, menuTabs, filterOptions, getTripInfo} from './data.js';
import {renderMenu} from './components/menu.js';
import {renderFilter} from './components/filter.js';
import {Event} from './components/event.js';
import {EventForm} from './components/event-form.js';
import {renderTripInfo} from './components/trip-info.js';

const EVENT_COUNT = 4;
const events = [...Array(EVENT_COUNT)].map(() => getEvent());

const tripInfo = document.querySelector(`.trip-info`);
const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);
const tripEvents = document.querySelector(`.trip-events`);
const tripCost = tripInfo.querySelector(`.trip-info__cost-value`);

/*const render = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};*/

const sortByStartDate = (array) => {
  return array.slice().sort((a, b) => {
    if (a.dateTime.dateStart < b.dateTime.dateStart) {
      return -1;
    }
    if (a.dateTime.dateStart > b.dateTime.dateStart) {
      return 1;
    }
    return 0;
  });
};

const renderEvent = (eventMock) => {
  const event = new Event(eventMock);
  const eventForm = new EventForm(eventMock);

  const onEscKeyDown = (evt) => {
    if (evt.key === `Escape` || evt.key === `Esc`) {
      //tasksContainer.replaceChild(task.getElement(), taskEdit.getElement());
      //document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };

  event.getElement()
    //.querySelector(`.card__btn--edit`)
    //.addEventListener(`click`, () => {
      //tasksContainer.replaceChild(taskEdit.getElement(), task.getElement());
      //document.addEventListener(`keydown`, onEscKeyDown);
    //});

  render(tripEvents, event.getElement(), Position.BEFOREEND);
}

const renderEventsList = (eventsToList) => {
  let eventsArray = [];
  eventsToList.forEach((event) => eventsArray.push(renderEvent(event)));
  return eventsArray.join(``);
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

const eventsSorted = sortByStartDate(events);
const eventMocks = new Array(EVENT_COUNT)
                .fill(``)
                .map(getEvent);

render(tripEvents, renderEventForm(eventsSorted[0]), `beforeend`);
render(tripEvents, renderEventsList(eventsSorted.slice(1, eventsSorted.length)), `beforeend`);
render(tripInfo, renderTripInfo(getTripInfo(eventsSorted)), `afterbegin`);
tripCost.innerHTML = countTripCost(events);
