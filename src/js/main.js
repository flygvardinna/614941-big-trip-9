import {Position, render} from './utils.js';
import {getEvent, menuTabs, filterOptions} from './data.js';
import {Menu} from './components/menu.js';
import {Filter} from './components/filter.js';
import {TripController} from './controllers/trip.js';
import {TripDetails} from './components/trip-details.js';

const EVENT_COUNT = 6;

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
// console.log(eventsSorted);
// TODO: Put events sorting to controller also

const tripController = new TripController(tripEvents, eventsSorted);
tripController.init();
// TODO: Make offers of event and eventForm be the same

const tripDetails = new TripDetails(eventsSorted);
render(tripInfo, tripDetails.getElement(), Position.AFTERBEGIN);
// TODO: fix getTripDetails function, dateEnd isn't correct sometimes
tripCost.innerHTML = countTripCost(eventsSorted);
