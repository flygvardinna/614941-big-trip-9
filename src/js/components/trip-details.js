import {createElement} from '../utils.js';

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
  tripDates[1] = new Date(eventsList[eventsList.length - 1].dateTime.dateEnd()).toString().slice(4, 10);
  return tripDates.join(`&nbsp;—&nbsp;`);
};

export class TripDetails {
  constructor(eventsList) {
    this._element = null;
    this._title = getTripTitle(eventsList);
    this._dates = getTripDates(eventsList);
  }

  getElement() {
    if (!this._element) {
      this._element = createElement(this.getTemplate());
    }

    return this._element;
  }

  removeElement() {
    if (this._element) {
      this._element = null;
    }
  }

  getTemplate() {
    return `<div class="trip-info__main">
      <h1 class="trip-info__title">${this._title}</h1>
      <p class="trip-info__dates">${this._dates}</p>
    </div>`.trim();
  }
}
