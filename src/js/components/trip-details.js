import {AbstractComponent} from './abstract-component';
import moment from '../../../node_modules/moment/src/moment';

const getTripTitle = (eventsList) => {
  let tripRoute = Array.from(eventsList).map((event) => event.destination.name);
  if (tripRoute.length > 3) {
    let tripTitle = [];
    tripTitle.push(tripRoute.shift(), tripRoute.pop());
    return tripTitle.join(` — ... — `);
  } else {
    return tripRoute.join(` — `);
  }
};

const getTripDates = (eventsList) => {
  let tripDates = [...Array(2)];
  tripDates[0] = moment(eventsList[0].dateStart).format(`MMM DD`);
  tripDates[1] = moment(eventsList[eventsList.length - 1].dateEnd).format(`MMM DD`);
  return tripDates.join(`&nbsp;—&nbsp;`);
};

export class TripDetails extends AbstractComponent {
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
