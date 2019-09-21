import {Position, render} from './utils';
import {getEvent, menuTabs, filterOptions} from './data';
import {Menu} from './components/menu';
import {Filter} from './components/filter';
import {Statistics} from './components/statistics';
import {TripController} from './controllers/trip';

const EVENT_COUNT = 6;

const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);
const tripEvents = document.querySelector(`.trip-events`);
const addNewEventButton = document.querySelector(`.trip-main__event-add-btn`);

const menu = new Menu(menuTabs);
render(tripMenuTitle, menu.getElement(), Position.AFTEREND);

const filter = new Filter(filterOptions);
render(tripControls, filter.getElement(), Position.BEFOREEND);

const statistics = new Statistics();

const eventMocks = new Array(EVENT_COUNT)
                .fill(``)
                .map(getEvent);

// console.log(eventMocks);
// TODO: Put events sorting to controller also - ГОТОВО

const tripController = new TripController(tripEvents, eventMocks);
tripController.init();
// TODO: Make offers of event and eventForm be the same

// стоимость путешествия и инфо о путешествии должны переехать в trip controller тоже потому что они будут пересчитываться
// после изменения данных

menu.getElement().addEventListener(`click`, (evt) => {
  evt.preventDefault();

  if (evt.target.tagName !== `A`) {
    return;
  }

  switch (evt.target.innerHTML) {
    case `Table`:
      statistics.getElement().classList.add(`visually-hidden`);
      tripController.show();
      break;
    case `Stats`:
      tripController.hide();
      render(tripEvents, statistics.getElement(), Position.AFTEREND);
      statistics.getElement().classList.remove(`visually-hidden`);
      statistics.renderCharts(tripController._events);
      break;
  }
  // здесь еще нужно переключать класс trip-tabs__btn--active
  // evt.target.classList.toggle(`trip-tabs__btn--active`);
});

addNewEventButton.addEventListener(`click`, () => {
  tripController.addEvent();
  addNewEventButton.setAttribute(`disabled`, `disabled`);
  // кажется, мне не нужен отдельный компонент event-add, должна быть все та же форма редактирования,
  // только без звездочки избранного и там кнопка Cancel вместо Delete
  // для нового ивента нужно будет реализовать загрузку списка опций после выбора дестинейшн.
  // Сейчас этого в разметке новой точки нет. И описание тоже должно подгружаться, наверное
});
