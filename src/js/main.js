import {Position, createElement, render, unrender} from './utils.js';
import {getEvent, menuTabs, filterOptions, getTripDetails} from './data.js';
import {Menu} from './components/menu.js';
import {Filter} from './components/filter.js';
import {Event} from './components/event.js';
import {EventForm} from './components/event-form.js';
import {TripDetails} from './components/trip-details.js';

const EVENT_COUNT = 4;

const tripInfo = document.querySelector(`.trip-info`);
const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);
const tripEvents = document.querySelector(`.trip-events`);
const tripCost = tripInfo.querySelector(`.trip-info__cost-value`);

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
      tripEvents.replaceChild(event.getElement(), eventForm.getElement());
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };

  event.getElement()
    .querySelector(`.event__rollup-btn`)
    .addEventListener(`click`, () => {
      tripEvents.replaceChild(eventForm.getElement(), event.getElement());
      document.addEventListener(`keydown`, onEscKeyDown);
    });

  eventForm.getElement()
    .addEventListener(`submit`, () => {
      tripEvents.replaceChild(event.getElement(), eventForm.getElement());
      document.removeEventListener(`keydown`, onEscKeyDown);
    });

  eventForm.getElement()
    .querySelector(`.event__rollup-btn`)
    .addEventListener(`click`, () => {
      tripEvents.replaceChild(event.getElement(), eventForm.getElement());
      document.removeEventListener(`keydown`, onEscKeyDown);
    });

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

const menu = new Menu(menuTabs);
render(tripMenuTitle, menu.getElement(), Position.AFTEREND);

const filter = new Filter(filterOptions);
render(tripControls, filter.getElement(), Position.BEFOREEND);

const eventMocks = new Array(EVENT_COUNT)
                .fill(``)
                .map(getEvent);

const eventsSorted = sortByStartDate(eventMocks);
eventsSorted.forEach((eventMock) => renderEvent(eventMock));
// TODO: Make offers of event and eventForm be the same

const tripDetails = new TripDetails(getTripDetails(eventsSorted));
render(tripInfo, tripDetails.getElement(), Position.AFTERBEGIN);
// TODO: fix getTripDetails function, dateEnd isn't correct sometimes
tripCost.innerHTML = countTripCost(eventsSorted);
