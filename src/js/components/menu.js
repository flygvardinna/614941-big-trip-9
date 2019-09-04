import {createElement} from '../utils.js';

export class Menu {
  constructor (tabs) {
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

  createTabs (menuTabs) {
    let tabsToRender = [];
    menuTabs.forEach((tab) => {
      tabsToRender.push(`<a class="trip-tabs__btn" href="#">${tab}</a>`);
    });
    return tabsToRender.join(``);
    // TODO: add class active for first item
  };

  getTemplate() {
    return `<nav class="trip-controls__trip-tabs  trip-tabs">
      ${this.createTabs(this._tabs)}
    </nav>`;
  }
}
