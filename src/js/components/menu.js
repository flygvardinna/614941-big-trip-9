const createTabs = (menuTabs) => {
  let tabsToRender = [];
  menuTabs.forEach((tab) => {
    tabsToRender.push(`<a class="trip-tabs__btn" href="#">${tab}</a>`);
  });
  return tabsToRender.join(``);
  // TODO: add class active for first item
};

export const renderMenu = (tabs) => {
  return `<nav class="trip-controls__trip-tabs  trip-tabs">
    ${createTabs(tabs)}
  </nav>`;
};
