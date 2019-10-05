import AbstractComponent from './abstract-component';

const createTabs = (tabsToRender) => {
  const menuTabs = [];
  tabsToRender.forEach((tab) => {
    menuTabs.push(`<a class="trip-tabs__btn ${tab === `Table` ? `trip-tabs__btn--active` : ``}" href="#">${tab}</a>`);
  });
  return menuTabs.join(``);
};

export default class Menu extends AbstractComponent {
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
