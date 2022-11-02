import moment from '../../node_modules/moment/src/moment';

export const ACTIVITY_TYPES = new Set([`check-in`, `sightseeing`, `restaurant`]);

export const TRANSPORT_TYPES = new Set([`taxi`, `bus`, `train`, `ship`, `drive`, `flight`]);

export const getPlaceholder = (type) => {
  return ACTIVITY_TYPES.has(type) ? `in` : `to`;
};

export const Position = {
  AFTERBEGIN: `afterbegin`,
  AFTEREND: `afterend`,
  BEFOREBEGIN: `beforebegin`,
  BEFOREEND: `beforeend`
};

export const Mode = {
  ADDING: `adding`,
  DEFAULT: `default`,
};

export const Key = {
  ESCAPE_IE: `Escape`,
  ESCAPE: `Esc`,
};

export const createElement = (template) => {
  const newElement = document.createElement(`div`);
  newElement.innerHTML = template;
  return newElement.firstChild;
};

export const render = (container, element, place) => {
  switch (place) {
    case Position.AFTERBEGIN:
      container.prepend(element);
      break;
    case Position.AFTEREND:
      container.after(element);
      break;
    case Position.BEFOREEND:
      container.append(element);
      break;
  }
};

export const unrender = (element) => {
  if (element) {
    element.remove();
    element = null;
  }
};

export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const countEventDuration = (dateStart, dateEnd) => {
  return moment.duration(moment(dateEnd).diff(moment(dateStart)));
};

export const renderEventDuration = (duration) => {
  const months = duration.months();
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  let durationToRender = ``;
  if (months) {
    durationToRender = `More than a month`;
    return durationToRender;
  }
  if (days) {
    durationToRender = `${days}D`;
  }
  if (hours) {
    durationToRender = `${durationToRender} ${hours}H`;
  }
  durationToRender = `${durationToRender} ${minutes}M`;
  return durationToRender;
};
