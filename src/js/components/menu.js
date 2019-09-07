import {createElement} from '../utils.js';

const createTabs = (menuTabs) => {
  let tabsToRender = [];
  menuTabs.forEach((tab) => {
    tabsToRender.push(`<a class="trip-tabs__btn" href="#">${tab}</a>`);
  });
  return tabsToRender.join(``);
  // TODO: add class active for first item
};

export class Menu {
  constructor(tabs) {
    this._element = null;
    this._tabs = tabs;
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
    return `<nav class="trip-controls__trip-tabs  trip-tabs">
      ${createTabs(this._tabs)}
    </nav>`;
  }
}
