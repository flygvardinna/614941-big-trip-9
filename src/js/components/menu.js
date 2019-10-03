import {AbstractComponent} from './abstract-component';

const createTabs = (menuTabs) => {
  let tabsToRender = [];
  menuTabs.forEach((tab) => {
    tabsToRender.push(`<a class="trip-tabs__btn ${tab === `Table` ? `trip-tabs__btn--active` : ``}" href="#">${tab}</a>`);
  });
  return tabsToRender.join(``);
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
