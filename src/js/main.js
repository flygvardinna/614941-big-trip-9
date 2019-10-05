import API from './api';
import Menu from './components/menu';
import Filter from './components/filter';
import Statistics from './components/statistics';
import Message from './components/message';
import TripController from './controllers/trip';
import {Position, render, unrender} from './utils';

const AUTHORIZATION = `Basic 77755866gf6665454D`;
const END_POINT = `https://htmlacademy-es-9.appspot.com/big-trip/`;
const MENU_TABS = [`Table`, `Stats`];
const FILTER_TABS = [`everything`, `future`, `past`];

let availableDestinations = [];
let availableOffers = [];
let tripEvents = [];
let tripController;

const api = new API({endPoint: END_POINT, authorization: AUTHORIZATION});
const menu = new Menu(MENU_TABS);
const filter = new Filter(FILTER_TABS);
const statistics = new Statistics();
const loadingMessage = new Message(`load`);

const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);
const eventsContainer = document.querySelector(`.trip-events`);
const addNewEventButton = document.querySelector(`.trip-main__event-add-btn`);

const onDataChange = (actionType, update, onError, onSuccessEventCreate) => {
  switch (actionType) {
    case `update`:
      api.updateEvent({
        id: update.id,
        event: update.toRAW()
      }).then((updatedEvent) => {
        for (let event of tripEvents) {
          if (updatedEvent.id === event.id) {
            event = updatedEvent;
            break;
          }
        }
        tripController.show(tripEvents);
      })
      .catch(() => onError());
      break;
    case `create`:
      api.createEvent({
        event: update.toRAW()
      }).then((newEvent) => {
        onSuccessEventCreate();
        tripEvents.push(newEvent);
        tripController.show(tripEvents);
      }).catch(() => onError());
      break;
    case `delete`:
      api.deleteEvent({
        id: update.id
      })
        .then(() => api.getEvents())
        .then((events) => {
          tripEvents = events;
          tripController.show(tripEvents);
        })
        .catch(() => onError());
      break;
  }
};

render(tripMenuTitle, menu.getElement(), Position.AFTEREND);
render(tripControls, filter.getElement(), Position.BEFOREEND);
render(eventsContainer, loadingMessage.getElement(), Position.BEFOREEND);

api.getDestinations()
  .then((destinations) => {
    availableDestinations = destinations;
  })
  .then(() => api.getOffers())
  .then((offers) => {
    availableOffers = offers;
  })
  .then(() => api.getEvents())
  .then((events) => {
    unrender(loadingMessage.getElement());
    tripEvents = events.slice();
    tripController = new TripController(eventsContainer, onDataChange, availableDestinations, availableOffers);
    tripController.show(tripEvents);
  });

menu.getElement().addEventListener(`click`, (evt) => {
  const activeTab = menu.getElement().querySelector(`.trip-tabs__btn--active`);

  if (evt.target.tagName !== `A` || evt.target === activeTab) {
    return;
  }

  activeTab.classList.remove(`trip-tabs__btn--active`);
  evt.target.classList.add(`trip-tabs__btn--active`);

  switch (evt.target.innerHTML) {
    case `Table`:
      statistics.getElement().classList.add(`visually-hidden`);
      tripController._container.classList.remove(`trip-events--hidden`);
      break;
    case `Stats`:
      tripController.hide();
      render(eventsContainer, statistics.getElement(), Position.AFTEREND);
      statistics.getElement().classList.remove(`visually-hidden`);
      statistics.renderCharts(tripController._events);
      break;
  }
});

addNewEventButton.addEventListener(`click`, () => {
  tripController.addEvent();
  addNewEventButton.setAttribute(`disabled`, `disabled`);
});
