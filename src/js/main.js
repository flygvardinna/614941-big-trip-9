import {Position, render} from './utils';
import {API} from './api';
import {Menu} from './components/menu';
import {Filter} from './components/filter';
import {Statistics} from './components/statistics';
import {TripController} from './controllers/trip';

const AUTHORIZATION = `Basic 484894743984444`;
const END_POINT = `https://htmlacademy-es-9.appspot.com/big-trip/`;

const MENU_TABS = [`Table`, `Stats`];
const FILTER_OPTIONS = [`everything`, `future`, `past`];

const api = new API({endPoint: END_POINT, authorization: AUTHORIZATION});

const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);
const eventsContainer = document.querySelector(`.trip-events`);
const addNewEventButton = document.querySelector(`.trip-main__event-add-btn`); // это остается в main так как кнопка работает
// пока объекта tripController еще вобщще нет на странице

const menu = new Menu(MENU_TABS);
render(tripMenuTitle, menu.getElement(), Position.AFTEREND);

const filter = new Filter(FILTER_OPTIONS);
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
  console.log(destinations);
  availableDestinations = destinations;
});

let availableOffers = [];
api.getOffers().then((offers) => {
  console.log(offers);
  availableOffers = offers;
});

// можно destinations и offers объединить в один метод и подставлять нужный url

let tripController;
let eventsList;

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
        console.log(newEvent); // поменять название event на point везде, чтоб не было путаницы, или так уже оставим?
        onSuccessEventCreate();
        eventsList.push(newEvent);
        tripController.show(eventsList);
        // какая-то путаница с айдишниками (проверь, что все ок)
      }).catch(() => onError());
      break;
    case `delete`:
      api.deleteEvent({
        id: update.id
      })
        .then(() => api.getEvents())
        .then((events) => {
          tripController.show(events);
        })
        .catch(() => onError());
      break;
  }
};

api.getEvents().then((events) => {
  console.log(events);
  eventsList = events.slice(); // чтобы не преобразовывать исходный массив? надо ли это?
  tripController = new TripController(eventsContainer, onDataChange, availableDestinations, availableOffers); // сюда можно передавать
  // ивенты, просто тогда метод show должен вызываться без аргументов и брать ивенты из конструктора tripController
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
      // тут ошибка с переключением табов
      break;
    case `Stats`:
      tripController.hide();
      render(eventsContainer, statistics.getElement(), Position.AFTEREND);
      statistics.getElement().classList.remove(`visually-hidden`);
      statistics.renderCharts(tripController._events);
      menu.querySelector(`.trip-tabs__btn--active`).classList.remove(`trip-tabs__btn--active`);
      evt.target.classList.toggle(`.trip-tabs__btn--active`);
      // вынести эти 2 строки в функцию, потому что повторяется? Может, фильтры не надо вставлять из data
      // реши вопрос, что происходит, если при клике на новый ивент открыта статитстика
      // пусть в этом случае переключается вкладка на таблицу
      break;
  }
  // здесь еще нужно переключать класс trip-tabs__btn--active
  // evt.target.classList.toggle(`trip-tabs__btn--active`);
});

addNewEventButton.addEventListener(`click`, () => {
  tripController.addEvent();
  addNewEventButton.setAttribute(`disabled`, `disabled`);
  // отработай сценарий если событий пока нет
});
