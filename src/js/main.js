import {Position, render} from './utils';
import {API} from './api';
import {Menu} from './components/menu';
import {Filter} from './components/filter';
import {Statistics} from './components/statistics';
import {TripController} from './controllers/trip';

const AUTHORIZATION = `Basic 484894743984444`;
const END_POINT = `https://htmlacademy-es-9.appspot.com/big-trip/`;

export const menuTabs = [`Table`, `Stats`];
export const filterOptions = [`everything`, `future`, `past`];

const api = new API({endPoint: END_POINT, authorization: AUTHORIZATION});

const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);
const eventsContainer = document.querySelector(`.trip-events`);
const addNewEventButton = document.querySelector(`.trip-main__event-add-btn`);

const menu = new Menu(menuTabs);
render(tripMenuTitle, menu.getElement(), Position.AFTEREND);

const filter = new Filter(filterOptions);
render(tripControls, filter.getElement(), Position.BEFOREEND);

const statistics = new Statistics();

// TODO: Put events sorting to controller also - ГОТОВО

/* const tripController = new TripController(tripEvents, eventMocks);
tripController.init(); */
// TODO: Make offers of event and eventForm be the same

// стоимость путешествия и инфо о путешествии должны переехать в trip controller тоже потому что они будут пересчитываться
// после изменения данных

let availableDestinations = [];
api.getDestinations().then((destinations) => {
  // console.log(destinations);
  availableDestinations = destinations;
});

let availableOffers = [];
api.getOffers().then((offers) => {
  // console.log(offers);
  availableOffers = offers;
});

let tripController;
let eventsList;

export const onDataChange = (actionType, update) => {
  switch (actionType) {
    case `update`:
      api.updateEvent({
        id: update.id,
        data: update.toRAW()
      }).then((updatedEvent) => {
        // console.log(updatedEvent); // поменять название event на point везде, чтоб не было путаницы, или так уже оставим?
        for (let event of eventsList) {
          if (updatedEvent.id === event.id) { // может быть это не надо, мы ведь уже изменили элемент, без копирования массива?
            event = updatedEvent;
            // console.log(eventsList);
          }
        }
        tripController.show(eventsList); // карточка исчезает - удаляется, но после обновления стараницы все ок
        // какая-то путаница с айдишниками
      });
      break;
    case `delete`:
      api.deleteEvent({
        id: update.id
      })
        .then(() => api.getEvents())
        .then((events) => tripController.show(events));
      break;
  }
};

api.getEvents().then((events) => {
  // console.log(events);
  eventsList = events.slice(); // чтобы не преобразовывать исходный массив? надо ли это?
  tripController = new TripController(eventsContainer, onDataChange, availableDestinations, availableOffers);
  tripController.show(eventsList);
});
// иногда с сервера приходят пустые destinations и offers тогда код не работает нормально
// надо проверять, и, если пустые, не давать вызвать контроллер

menu.getElement().addEventListener(`click`, (evt) => {
  evt.preventDefault();

  if (evt.target.tagName !== `A`) {
    return;
  }

  switch (evt.target.innerHTML) {
    case `Table`:
      statistics.getElement().classList.add(`visually-hidden`);
      tripController._container.classList.remove(`trip-events--hidden`);
      menu.querySelector(`.trip-tabs__btn--active`).classList.remove(`trip-tabs__btn--active`);
      evt.target.classList.toggle(`.trip-tabs__btn--active`);
      // tripController.show(eventsList);
      // возможно, тут не надо отрисовывать по новой, а просто убирать хидден с того, что было, старый вариант функции show
      break;
    case `Stats`:
      tripController.hide();
      render(eventsContainer, statistics.getElement(), Position.AFTEREND);
      statistics.getElement().classList.remove(`visually-hidden`);
      statistics.renderCharts(tripController._events);
      menu.querySelector(`.trip-tabs__btn--active`).classList.remove(`trip-tabs__btn--active`);
      evt.target.classList.toggle(`.trip-tabs__btn--active`);
      // вынести эти 2 строки в функцию, потому что повторяется? Может, фильтры не надо вставлять из data
      break;
  }
  // здесь еще нужно переключать класс trip-tabs__btn--active
  // evt.target.classList.toggle(`trip-tabs__btn--active`);
});

addNewEventButton.addEventListener(`click`, () => {
  tripController.addEvent();
  addNewEventButton.setAttribute(`disabled`, `disabled`);
});
