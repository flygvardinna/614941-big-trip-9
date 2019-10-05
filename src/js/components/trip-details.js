import AbstractComponent from './abstract-component';
import moment from '../../../node_modules/moment/src/moment';

const DESTINATION_COUNT = 3;

const getTitle = (eventsList) => {
  const destinations = Array.from(eventsList).map((event) => event.destination.name);
  if (destinations.length > DESTINATION_COUNT) {
    const points = [];
    points.push(destinations.shift(), destinations.pop());
    return points.join(` — ... — `);
  } else {
    return destinations.join(` — `);
  }
};

const getDates = (eventsList) => {
  const dates = [];
  dates.push(moment(eventsList[0].dateStart).format(`MMM DD`));
  dates.push(moment(eventsList[eventsList.length - 1].dateEnd).format(`MMM DD`));
  return dates.join(`&nbsp;—&nbsp;`);
};

export default class TripDetails extends AbstractComponent {
  constructor(eventsList) {
    super();
    this._title = getTitle(eventsList);
    this._dates = getDates(eventsList);
  }

  getTemplate() {
    return `<div class="trip-info__main">
      <h1 class="trip-info__title">${this._title}</h1>
      <p class="trip-info__dates">${this._dates}</p>
    </div>`.trim();
  }
}
