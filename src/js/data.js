import {shuffleArray} from './utils';

const PICTURE_COUNT = 5;

export const getEvent = () => ({
  type: [
    `taxi`, `bus`, `train`, `ship`, `transport`, `drive`, `flight`, `check-in`, `sightseeing`, `restaurant`
  ][Math.floor(Math.random() * 10)],
  destination: [
    `Paris`, `London`, `New York`, `Moscow`, `Amsterdam`, `Tokyo`, `Madrid`, `Buenos Aires`, `Lisbon`, `Rome`
  ][Math.floor(Math.random() * 10)],
  dateStart: Date.now() + 1 + Math.floor(Math.random() * 7) * (Math.random() * 25) * 60 * 60 * 1000,
  /* dateEnd() {
    return this.dateStart + (Math.random() * 25) * 60 * 60 * 1000;
  }, */
  dateEnd: Date.now() + 8 * 24 * 60 * 60 * 1000,
  price: Math.floor(Math.random() * 500 + 1),
  offers() {
    let offersList = [
      {name: `Add luggage`,
        price: 10,
        selected: Boolean(Math.round(Math.random()))},
      {name: `Switch to comfort class`,
        price: 150,
        selected: Boolean(Math.round(Math.random()))},
      {name: `Add meal`,
        price: 2,
        selected: Boolean(Math.round(Math.random()))},
      {name: `Choose seats`,
        price: 9,
        selected: Boolean(Math.round(Math.random()))},
    ];
    const offersCount = Math.floor(Math.random() * 3);
    return shuffleArray(offersList).slice(0, offersCount);
  },
  description() {
    let descriptionList = [
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      `Cras aliquet varius magna, non porta ligula feugiat eget.`,
      `Fusce tristique felis at fermentum pharetra.`,
      `Aliquam id orci ut lectus varius viverra.`,
      `Nullam nunc ex, convallis sed finibus eget, sollicitudin eget ante.`,
      `Phasellus eros mauris, condimentum sed nibh vitae, sodales efficitur ipsum.`,
      `Sed blandit, eros vel aliquam faucibus, purus ex euismod diam, eu luctus nunc ante ut dui.`,
      `Sed sed nisi sed augue convallis suscipit in sed felis.`,
      `Aliquam erat volutpat.`,
      `Nunc fermentum tortor ac porta dapibus.`,
      `In rutrum ac purus sit amet tempus.`
    ];
    const descriptionCount = Math.floor(Math.random() * 3) + 1;
    return shuffleArray(descriptionList).slice(0, descriptionCount).join(` `);
  },
  pictures: [...Array(PICTURE_COUNT)].map(() => `http://picsum.photos/300/150?r=${Math.random()}`)
  // добавится свойство isFavorite: true/false
});

export const menuTabs = [`Table`, `Stats`];

export const filterOptions = [`everything`, `future`, `past`];
