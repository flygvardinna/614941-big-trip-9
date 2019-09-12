import {AbstractComponent} from './abstract-component.js';

const getTripTitle = (eventsList) => {
  let tripRoute = [];
  eventsList.forEach((event) => {
    tripRoute.push(event.destination);
  });
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
  tripDates[0] = new Date(eventsList[0].dateTime.dateStart).toString().slice(4, 10);
  tripDates[1] = new Date(eventsList[eventsList.length - 1].dateTime.dateEnd).toString().slice(4, 10);
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
