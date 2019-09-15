import {Position, render} from './utils';
import {getEvent, menuTabs, filterOptions} from './data';
import {Menu} from './components/menu';
import {Filter} from './components/filter';
import {TripController} from './controllers/trip';

const EVENT_COUNT = 6;

const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);
const tripEvents = document.querySelector(`.trip-events`);

const menu = new Menu(menuTabs);
render(tripMenuTitle, menu.getElement(), Position.AFTEREND);

const filter = new Filter(filterOptions);
render(tripControls, filter.getElement(), Position.BEFOREEND);

const eventMocks = new Array(EVENT_COUNT)
                .fill(``)
                .map(getEvent);

// console.log(eventsSorted);
// TODO: Put events sorting to controller also

const tripController = new TripController(tripEvents, eventMocks);
tripController.init();
// TODO: Make offers of event and eventForm be the same

// стоимость путешествия и инфо о путешествии должны переехать в trip controller тоже потому что они будут пересчитываться
// после изменения данных
