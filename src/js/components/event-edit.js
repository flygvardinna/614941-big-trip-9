import AbstractComponent from './abstract-component';
import {
  ACTIVITY_TYPES,
  TRANSPORT_TYPES,
  Position,
  Mode,
  createElement,
  render,
  unrender,
  getPlaceholder,
  capitalize
} from '../utils';
import moment from '../../../node_modules/moment/src/moment';
import 'flatpickr/dist/flatpickr.min.css';
import 'flatpickr/dist/themes/light.css';

const renderPictures = (picturesToRender) => {
  const pictures = [];
  for (const picture of picturesToRender) {
    pictures.push(`<img class="event__photo" src="${picture.src}" alt="${picture.description}">`);
  }
  return pictures.join(``);
};

const checkIsOfferChecked = (offers, title) => {
  return offers.find((offer) => offer.title === title);
};

const createOffersList = (allOffers, type, checkedOffers) => {
  const offers = allOffers.map((offer) => {
    const isChecked = checkedOffers.length ? checkIsOfferChecked(checkedOffers, offer.title) : false;
    return getOfferTemplate(offer, type, isChecked);
  });
  return offers.join(``);
};

const getOfferTemplate = (offer, type, isChecked) => {
  return `<div class="event__offer-selector">
    <input class="event__offer-checkbox  visually-hidden" id="event-offer-${type}-${offer.id}" type="checkbox"
    name="event-offer-${type}" data-offer-id="${offer.id}" ${isChecked ? `checked` : ``}>
    <label class="event__offer-label" for="event-offer-${type}-${offer.id}">
      <span class="event__offer-title">${offer.title}</span>
      &plus;
      &euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
    </label>
  </div>`;
};

const getOffersListTemplate = (allOffers, eventType, checkedOffers = []) => {
  if (allOffers.length > 0) {
    return `<section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>

      <div class="event__available-offers">
      ${createOffersList(allOffers, eventType, checkedOffers)}
      </div>
    </section>`;
  }
  return ``;
};

const getDestinationTemplate = (eventDestination) => {
  return `<section class="event__section  event__section--destination">
    <h3 class="event__section-title  event__section-title--destination">Destination</h3>
    <p class="event__destination-description">${eventDestination.description}</p>

    <div class="event__photos-container">
      <div class="event__photos-tape">
        ${renderPictures(eventDestination.pictures)}
      </div>
    </div>
  </section>`;
};

const createDestinationsList = (availableDestinations) => {
  const destinations = [];
  for (const destination of availableDestinations) {
    destinations.push(`<option value="${destination.name}"></option>`);
  }
  return destinations.join(``);
};

const getTypeTemplate = (type) => {
  return `<div class="event__type-item">
    <input id="event-type-${type}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${type}">
    <label class="event__type-label  event__type-label--${type}" for="event-type-${type}-1">${capitalize(type)}</label>
  </div>`;
};

const createTypesList = (typesToRender) => {
  return typesToRender.map((type) => getTypeTemplate(type)).join(``);
};

export default class EventEdit extends AbstractComponent {
  constructor(mode, data, destinations, offers) {
    super();
    this._mode = mode;
    this._id = data.id;
    this._type = data.type;
    this._placeholder = getPlaceholder(data.type);
    this._destination = data.destination;
    this._dateStart = data.dateStart;
    this._dateEnd = data.dateEnd;
    this._price = data.price;
    this._offers = data.offers;
    this._isFavorite = data.isFavorite;
    this._destinations = destinations;
    this._offersByType = offers;
    this._transportTypes = Array.from(TRANSPORT_TYPES);
    this._activityTypes = Array.from(ACTIVITY_TYPES);

    this.onTypeChange = this.onTypeChange.bind(this);
    this.onDestinationChange = this.onDestinationChange.bind(this);
  }

  getTemplate() {
    const renderedOffers = this._renderOffersList();

    if (this._mode === Mode.DEFAULT) {
      return `<form class="event  event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="public/img/icons/${this._type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Transfer</legend>

                ${createTypesList(this._transportTypes)}
              </fieldset>

              <fieldset class="event__type-group">
                <legend class="visually-hidden">Activity</legend>

                ${createTypesList(this._activityTypes)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${capitalize(this._type)} ${this._placeholder}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${this._destination.name}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${createDestinationsList(this._destinations)}
            </datalist>
          </div>

          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">
              From
            </label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${this._dateStart}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">
              To
            </label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${this._dateEnd}">
          </div>

          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${this._price}">
          </div>

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>

          <input id="event-favorite-1" class="event__favorite-checkbox  visually-hidden" type="checkbox" name="event-favorite" ${this._isFavorite ? `checked` : ``}>
          <label class="event__favorite-btn" for="event-favorite-1">
            <span class="visually-hidden">Add to favorite</span>
            <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
              <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
            </svg>
          </label>

          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>

        ${renderedOffers || this._destination.description ? `<section class="event__details">

          ${renderedOffers}

          ${this._destination.description ? getDestinationTemplate(this._destination) : ``}

        </section>` : ``}

      </form>`.trim();
    }

    return `<form class="trip-events__item  event  event--edit" action="#" method="post">
      <header class="event__header">
        <div class="event__type-wrapper">
          <label class="event__type  event__type-btn" for="event-type-toggle-1">
            <span class="visually-hidden">Choose event type</span>
            <img class="event__type-icon" width="17" height="17" src="public/img/icons/${this._type}.png" alt="Event type icon">
          </label>
          <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

          <div class="event__type-list">
            <fieldset class="event__type-group">
              <legend class="visually-hidden">Transfer</legend>

              ${createTypesList(this._transportTypes)}
            </fieldset>

            <fieldset class="event__type-group">
              <legend class="visually-hidden">Activity</legend>

              ${createTypesList(this._activityTypes)}
            </fieldset>
          </div>
        </div>

        <div class="event__field-group  event__field-group--destination">
          <label class="event__label  event__type-output" for="event-destination-1">
            ${capitalize(this._type)} ${this._placeholder}
          </label>
          <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="" list="destination-list-1">
          <datalist id="destination-list-1">
            ${createDestinationsList(this._destinations)}
          </datalist>
        </div>

        <div class="event__field-group  event__field-group--time">
          <label class="visually-hidden" for="event-start-time-1">
            From
          </label>
          <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${moment(this._dateStart).format(`DD.MM.YYYY HH:mm`)}">
          &mdash;
          <label class="visually-hidden" for="event-end-time-1">
            To
          </label>
          <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${moment(this._dateEnd).format(`DD.MM.YYYY HH:mm`)}">
        </div>

        <div class="event__field-group  event__field-group--price">
          <label class="event__label" for="event-price-1">
            <span class="visually-hidden">Price</span>
            &euro;
          </label>
          <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="">
        </div>

        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
        <button class="event__reset-btn" type="reset">Cancel</button>
      </header>

      <section class="event__details visually-hidden"></section>
    </form>`;
  }

  onTypeChange(element, type) {
    element.querySelector(`.event__type-icon`).setAttribute(`src`, `public/img/icons/${type}.png`);
    element.querySelector(`.event__type-output`).innerHTML = `${capitalize(type)} ${getPlaceholder(type)}`;
    const eventDetails = element.querySelector(`.event__details`);
    const offersRendered = eventDetails.querySelector(`.event__section--offers`);
    if (offersRendered) {
      unrender(offersRendered);
    } else {
      eventDetails.classList.remove(`visually-hidden`);
    }

    for (const item of this._offersByType) {
      if (item.type === type) {
        const newOffers = getOffersListTemplate(item.offers, type);
        if (newOffers) {
          render(element.querySelector(`.event__details`), createElement(newOffers), Position.AFTERBEGIN);
        }
        break;
      }
    }
  }

  onDestinationChange(element, input) {
    for (const destination of this._destinations) {
      if (destination.name === input.value) {
        const eventDetails = element.querySelector(`.event__details`);
        const destinationRendered = eventDetails.querySelector(`.event__section--destination`);
        if (destinationRendered) {
          unrender(destinationRendered);
        }
        if (destination.description || destination.pictures) {
          const newDestination = getDestinationTemplate(destination);
          render(eventDetails, createElement(newDestination), Position.BEFOREEND);
          eventDetails.classList.remove(`visually-hidden`);
        }
        return;
      }
    }
    input.value = ``;
  }

  _renderOffersList() {
    const allOffers = this._offersByType.find((item) => item.type === this._type).offers;

    return getOffersListTemplate(allOffers, this._type, this._offers);
  }
}
