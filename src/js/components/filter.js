import {AbstractComponent} from './abstract-component.js';
import {capitalize} from '../utils.js';

const createFilters = (eventFilters) => {
  let filtersToRender = [];
  eventFilters.forEach((filter) => {
    filtersToRender.push(`<div class="trip-filters__filter">
      <input id="filter-${filter}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter" value="${filter}">
      <label class="trip-filters__filter-label" for="filter-${filter}">${capitalize(filter)}</label>
    </div>`);
  });
  return filtersToRender.join(``);
  // TODO: mark first filter as checked
};

export class Filter extends AbstractComponent {
  constructor(filters) {
    super();
    this._filters = filters;
  }

  getTemplate() {
    return `<form class="trip-filters" action="#" method="get">
      ${createFilters(this._filters)}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`;
  }
}
