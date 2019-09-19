import moment from '../../node_modules/moment/src/moment';

// const typesOfTransport = new Set([`taxi`, `bus`, `train`, `ship`, `transport`, `drive`, `flight`]);
const typesOfPlace = new Set([`check-in`, `sightseeing`, `restaurant`]);

export const getPlaceholder = (type) => {
  return typesOfPlace.has(type) ? `in` : `to`;
};

export const Position = {
  AFTERBEGIN: `afterbegin`,
  AFTEREND: `afterend`,
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
    // element.removeElement();
    // задание 4.1 Не забудьте после удаления элемента из DOM удалить ссылку на него
    // с помощью метода класса removeElement, который мы описали в пятом пункте.
  }
};

export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const countEventDuration = (dateStart, dateEnd) => {
  return moment.duration(moment(dateEnd).diff(moment(dateStart)));
};
