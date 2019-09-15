import {AbstractComponent} from './abstract-component';
import {getPlaceholder, capitalize, countEventDuration} from '../utils';
import moment from '../../../node_modules/moment/src/moment';

// TODO: fix warning in console about moment.js

const renderEventDuration = (duration) => {
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  let durationToRender;
  if (days) {
    durationToRender = `${days}D`;
  }
  if (hours) {
    durationToRender = durationToRender + ` ${hours}H`;
  }
  durationToRender = durationToRender + ` ${minutes}M`;
  return durationToRender;
};

const createOffersList = (offersList) => {
  let selectedOffers = [];
  offersList.forEach((offer) => {
    selectedOffers.push(offer.selected ? getOfferTemplate(offer) : ``);
  });
  return selectedOffers.join(``);
};

const getOfferTemplate = (offer) => {
  return `<li class="event__offer">
    <span class="event__offer-title">${offer.name}</span>
    &plus;
    &euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
   </li>`;
};

const getOffersTemplate = (offersToRender) => {
  if (offersToRender.length > 0) {
    return `<h4 class="visually-hidden">Offers:</h4>
    <ul class="event__selected-offers">
      ${createOffersList(offersToRender)}
    </ul>`;
  }
  return ``;
};

export class Event extends AbstractComponent {
  constructor({type, destination, dateStart, dateEnd, price, offers}) {
    super();
    this._type = type;
    this._placeholder = getPlaceholder(type);
    this._destination = destination;
    this._dateStart = dateStart;
    this._dateEnd = dateEnd;
    this._duration = renderEventDuration(countEventDuration(this._dateStart, this._dateEnd));
    this._price = price;
    this._offers = offers();
  }

  getTemplate() {
    return `<li class="trip-events__item">
    <div class="event">
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${this._type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${capitalize(this._type)} ${this._placeholder} ${this._destination}</h3>

      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${moment(this._dateStart).toISOString()}">${moment(this._dateStart).format(`HH:mm`)}</time>
          &mdash;
          <time class="event__end-time" datetime="${moment(this._dateEnd).toISOString()}">${moment(this._dateEnd).format(`HH:mm`)}</time>
        </p>
        <p class="event__duration">${this._duration}</p>
      </div>

      <p class="event__price">
        &euro;&nbsp;<span class="event__price-value">${this._price}</span>
      </p>

      ${getOffersTemplate(this._offers)}

      <button class="event__rollup-btn" type="button">
        <span class="visually-hidden">Open event</span>
      </button>
    </div>
    </li>`.trim();
  }
}
