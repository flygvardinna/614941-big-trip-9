import AbstractComponent from './abstract-component';
import {capitalize} from '../utils';

const createTabs = (tabsToRender) => {
  const filterTabs = [];
  for (const tab of tabsToRender) {
    filterTabs.push(`<div class="trip-filters__filter">
      <input id="filter-${tab}" class="trip-filters__filter-input  visually-hidden" type="radio" name="trip-filter"
      value="${tab}" ${tab === `everything` ? `checked` : ``}>
      <label class="trip-filters__filter-label" for="filter-${tab}">${capitalize(tab)}</label>
    </div>`);
  }
  return filterTabs.join(``);
};

export default class Filter extends AbstractComponent {
  constructor(tabs) {
    super();
    this._tabs = tabs;
  }

  getTemplate() {
    return `<form class="trip-filters" action="#" method="get">
      ${createTabs(this._tabs)}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>`;
  }
}
