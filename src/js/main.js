import {Position, render, unrender} from './utils';
import {API} from './api';
import {Menu} from './components/menu';
import {Filter} from './components/filter';
import {Statistics} from './components/statistics';
import {TripDetails} from './components/trip-details';
import {Message} from './components/message';
import {TripController} from './controllers/trip';

const AUTHORIZATION = `Basic 48888287766`; // перед отправкой на проверку обнови код для сервера
const END_POINT = `https://htmlacademy-es-9.appspot.com/big-trip/`;

const MENU_TABS = [`Table`, `Stats`];
const FILTER_OPTIONS = [`everything`, `future`, `past`];

const api = new API({endPoint: END_POINT, authorization: AUTHORIZATION});

const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);
const eventsContainer = document.querySelector(`.trip-events`);
const addNewEventButton = document.querySelector(`.trip-main__event-add-btn`);

const menu = new Menu(MENU_TABS);
render(tripMenuTitle, menu.getElement(), Position.AFTEREND);

const filter = new Filter(FILTER_OPTIONS);
render(tripControls, filter.getElement(), Position.BEFOREEND);

const statistics = new Statistics();

// TODO: Put events sorting to controller also - ГОТОВО

let availableDestinations = [];
let availableOffers = [];
let eventsList = [];
let tripController;

const onDataChange = (actionType, update, onError, onSuccessEventCreate) => {
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
            // Во-вторых, внутри нашей функции мы больше не пезаписываем моки, а взаимодействуем с сервером.
          }
        }
        tripController.show(eventsList); // карточка исчезает - удаляется, но после обновления стараницы все ок
        // какая-то путаница с айдишниками
      }).catch(() => onError());
      break;
    case `create`:
      api.createEvent({
        event: update.toRAW()
      }).then((newEvent) => {
        onSuccessEventCreate();
        eventsList.push(newEvent); // поменять название event на point везде, чтоб не было путаницы, или так уже оставим?
        tripController.show(eventsList);
      }).catch(() => onError());
      // В случае ошибки при создании новой точки нет красной обводки
      break;
    case `delete`:
      api.deleteEvent({
        id: update.id
      })
        .then(() => api.getEvents())
        .then((events) => {
          console.log(events);
          tripController.show(events);
          if (events.length === 0) {
            showNoEventsMessage();
            // после удаления всех ивентов остается сортировка
          }
        })
        .catch(() => onError());
      break;
  }
};



const loadingMessage = new Message(`load`);
render(eventsContainer, loadingMessage.getElement(), Position.BEFOREEND);

const showNoEventsMessage = () => {
  const noEventsMessage = new Message(`no-events`);
  render(eventsContainer, noEventsMessage.getElement(), Position.BEFOREEND);
}

api.getDestinations()
  .then((destinations) => {
    console.log(destinations);
    availableDestinations = destinations;
  })
  .then(() => api.getOffers())
  .then((offers) => {
    console.log(offers);
    availableOffers = offers;
  })
  .then(() => api.getEvents())
  .then((events) => {
    console.log(events);
    unrender(loadingMessage.getElement());
    eventsList = events.slice(); // чтобы не преобразовывать исходный массив? надо ли это?
    tripController = new TripController(eventsContainer, onDataChange, availableDestinations, availableOffers);
    if (events.length === 0) {
      showNoEventsMessage();
    }
    tripController.show(eventsList);
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
      // tripController.show(eventsList); НЕ ОТРИСОВЫВАЮ ПОКА И ТАК
      // возможно, тут не надо отрисовывать по новой, а просто убирать хидден с того, что было, старый вариант функции show
      break;
    case `Stats`:
      tripController.hide();
      render(eventsContainer, statistics.getElement(), Position.AFTEREND);
      statistics.getElement().classList.remove(`visually-hidden`);
      statistics.renderCharts(tripController._events);
      // реши вопрос, что происходит, если при клике на новый ивент открыта статитстика
      // пусть в этом случае переключается вкладка на таблицу
      break;
  }
});

addNewEventButton.addEventListener(`click`, () => {
  tripController.addEvent();
  addNewEventButton.setAttribute(`disabled`, `disabled`);
});
