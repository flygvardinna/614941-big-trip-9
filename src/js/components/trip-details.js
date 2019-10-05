import AbstractComponent from './abstract-component';
import moment from '../../../node_modules/moment/src/moment';

const DESTINATION_COUNT = 3;

const getTripTitle = (eventsList) => {
  const destinations = Array.from(eventsList).map((event) => event.destination.name);
  if (destinations.length > DESTINATION_COUNT) {
    const tripPoints = [];
    tripPoints.push(destinations.shift(), destinations.pop());
    return tripPoints.join(` — ... — `);
  } else {
    return destinations.join(` — `);
  }
};

const getTripDates = (eventsList) => {
  const tripDates = [];
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
