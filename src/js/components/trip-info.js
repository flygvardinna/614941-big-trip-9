export const renderTripInfo = ({ title, dates }) =>
  `<div class="trip-info__main">
    <h1 class="trip-info__title">${title}</h1>
    <p class="trip-info__dates">${dates}</p>
  </div>`.trim();
