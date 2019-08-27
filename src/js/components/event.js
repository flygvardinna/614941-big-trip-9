import {capitalize} from '../utils.js';

export const renderEvent = ({ eventType, destination, dateStart, dateEnd, duration, price, offers }) => {
  const renderOffers = offers => {
    const makeOffer = offer => {
      return `<li class="event__offer">
        <span class="event__offer-title">${offer.name}</span>
        &plus;
        &euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
       </li>`;
    };

    const createOffersList = (offers) => {
      let selectedOffers = [];
      offers.forEach(offer => selectedOffers.push(offer.selected ? makeOffer(offer) : ``));
      return selectedOffers.join(``);
    };

    return `<h4 class="visually-hidden">Offers:</h4>
    <ul class="event__selected-offers">
      ${createOffersList(offers)}
    </ul>`;
  };

  const showHours = date => {
    return date.toLocaleTimeString(navigator.language, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `<div class="event">
    <div class="event__type">
      <img class="event__type-icon" width="42" height="42" src="img/icons/${eventType.type}.png" alt="Event type icon">
    </div>
    <h3 class="event__title">${capitalize(eventType.type)} ${eventType.text} ${destination}</h3>

    <div class="event__schedule">
      <p class="event__time">
        <time class="event__start-time" datetime="${new Date(dateStart).toISOString()}">${showHours(new Date(dateStart))}</time>
        &mdash;
        <time class="event__end-time" datetime="${new Date(dateEnd).toISOString()}">${showHours(new Date(dateEnd))}</time>
      </p>
      <p class="event__duration">${duration.hours}H ${duration.minuts}M</p>
    </div>

    <p class="event__price">
      &euro;&nbsp;<span class="event__price-value">${price}</span>
    </p>

    ${(offers.length > 0) ? renderOffers(offers) : ``}

    <button class="event__rollup-btn" type="button">
      <span class="visually-hidden">Open event</span>
    </button>
  </div>`.trim();
};
