export const renderMenu = tabs => {
  let tabsToRender = [];
  const createTabs = tabs => {
    tabs.forEach(tab => {
      tabsToRender.push(`<a class="trip-tabs__btn" href="#">${tab}</a>`);
    });
    return tabsToRender.join(``);
    // TODO: add class active for first item
  };

  return `<nav class="trip-controls__trip-tabs  trip-tabs">
    ${createTabs(tabs)}
  </nav>`;
};
