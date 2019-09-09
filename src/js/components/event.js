import {AbstractComponent} from './abstract-component.js';
import {capitalize} from '../utils.js';

const renderHours = (date) => {
  return date.toLocaleTimeString(navigator.language, {
    hour: `2-digit`,
    minute: `2-digit`
  });
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
  constructor({type, destination, dateTime, price, offers}) {
    super();
    this._type = type.name;
    this._text = type.text;
    this._destination = destination;
    this._dateStart = new Date(dateTime.dateStart);
    this._dateEnd = new Date(dateTime.dateEnd());
    this._duration = dateTime.duration(this._dateStart, this._dateEnd);
    this._price = price;
    this._offers = offers();
  }

  getTemplate() {
    return `<li class="trip-events__item">
    <div class="event">
      <div class="event__type">
        <img class="event__type-icon" width="42" height="42" src="img/icons/${this._type}.png" alt="Event type icon">
      </div>
      <h3 class="event__title">${capitalize(this._type)} ${this._text} ${this._destination}</h3>

      <div class="event__schedule">
        <p class="event__time">
          <time class="event__start-time" datetime="${this._dateStart}">${renderHours(this._dateStart)}</time>
          &mdash;
          <time class="event__end-time" datetime="${this._dateEnd}">${renderHours(this._dateEnd)}</time>
        </p>
        <p class="event__duration">${this._duration.hours}H ${this._duration.minuts()}M</p>
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
