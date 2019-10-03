import AbstractComponent from './abstract-component';
import moment from '../../../node_modules/moment/src/moment';

const CITY_NAME_COUNT = 3;

const getTripTitle = (eventsList) => {
  let tripRoute = Array.from(eventsList).map((event) => event.destination.name);
  if (tripRoute.length > CITY_NAME_COUNT) {
    let tripTitle = [];
    tripTitle.push(tripRoute.shift(), tripRoute.pop());
    return tripTitle.join(` — ... — `);
  } else {
    return tripRoute.join(` — `);
  }
};

const getTripDates = (eventsList) => {
  let tripDates = [];
  tripDates.push(moment(eventsList[0].dateStart).format(`MMM DD`));
  tripDates.push(moment(eventsList[eventsList.length - 1].dateEnd).format(`MMM DD`));
  return tripDates.join(`&nbsp;—&nbsp;`);
};

export default class TripDetails extends AbstractComponent {
  constructor(eventsList) {
    super();
    this._title = getTripTitle(eventsList);
    this._dates = getTripDates(eventsList);
  }

  getTemplate() {
    return `<div class="trip-info__main">
      <h1 class="trip-info__title">${this._title}</h1>
      <p class="trip-info__dates">${this._dates}</p>
    </div>`.trim();
  }
}
