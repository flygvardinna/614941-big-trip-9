import {createMenuTemplate} from './components/menu.js';
import {createFilterTemplate} from './components/filter.js';
import {createEventTemplate} from './components/event.js';
import {createEventFormTemplate} from './components/event-form.js';
import {createTripDetailsTemplate} from './components/trip-details.js';

const render = (container, template, place) => {
  container.insertAdjacentHTML(place, template);
};

const tripInfo = document.querySelector(`.trip-info`);
const tripControls = document.querySelector(`.trip-controls`);
const tripMenuTitle = tripControls.querySelector(`h2`);

render(tripInfo, createTripDetailsTemplate(), `afterbegin`);
render(tripMenuTitle, createMenuTemplate(), `afterend`);
render(tripControls, createFilterTemplate(), `beforeend`);

const tripEvents = document.querySelector(`.trip-events`);

render(tripEvents, createEventFormTemplate(), `beforeend`);
new Array(3).fill(``).forEach(() => render(tripEvents, createEventTemplate(), `beforeend`));
