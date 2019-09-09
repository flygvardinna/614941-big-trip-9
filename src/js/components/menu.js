import {AbstractComponent} from './abstract-component.js';

const createTabs = (menuTabs) => {
  let tabsToRender = [];
  menuTabs.forEach((tab) => {
    tabsToRender.push(`<a class="trip-tabs__btn" href="#">${tab}</a>`);
  });
  return tabsToRender.join(``);
  // TODO: add class active for first item
};

export class Menu extends AbstractComponent {
  constructor(tabs) {
    super();
    this._tabs = tabs;
  }

  getTemplate() {
    return `<nav class="trip-controls__trip-tabs  trip-tabs">
      ${createTabs(this._tabs)}
    </nav>`;
  }
}
