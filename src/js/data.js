import {shuffleArray} from './utils.js';

const PICTURES_COUNT = 5;

export const getEvent = () => ({
  type: [
    {name: `taxi`, text: `to`},
    {name: `bus`, text: `to`},
    {name: `train`, text: `to`},
    {name: `ship`, text: `to`},
    {name: `transport`, text: `to`},
    {name: `drive`, text: `to`},
    {name: `flight`, text: `to`},
    {name: `check`, text: `in`},
    {name: `sightseeing`, text: `in`},
    {name: `restaurant`, text: `in`}][Math.floor(Math.random() * 10)],
  destination: [
    `Paris`, `London`, `New York`, `Moscow`, `Amsterdam`, `Tokyo`, `Madrid`, `Buenos Aires`, `Lisbon`, `Rome`
  ][Math.floor(Math.random() * 10)],
  dateTime: {
    dateStart: Date.now() + 1 + Math.floor(Math.random() * 7) * (Math.random() * 25) * 60 * 60 * 1000,
    dateEnd() {
      return this.dateStart + (Math.random() * 25) * 60 * 60 * 1000;
    },
    duration() {
      const duration = (this.dateEnd() - this.dateStart) / (60 * 60 * 1000);
      return {
        hours: Math.trunc(duration),
        minuts() {
          return Math.round((duration - this.hours) * 60);
        },
      };
    }
  },
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
  pictures() {
    const pictures = [...Array(PICTURES_COUNT)].map(() => `http://picsum.photos/300/150?r=${Math.random()}`);
    return pictures;
  }
});

export const menuTabs = [`Table`, `Stats`];

export const filterOptions = [`everything`, `future`, `past`];

export const getTripInfo = (eventsList) => ({
  title() {
    let tripRoute = [];
    eventsList.forEach((event) => {
      tripRoute.push(event.destination);
    });
    if (tripRoute.length > 3) {
      let tripTitle = [];
      tripTitle.push(tripRoute.shift(), tripRoute.pop());
      return tripTitle.join(` — ... — `);
    } else {
      return tripRoute.join(` — `);
    }
  },
  dates() {
    let tripDates = [...Array(2)];
    tripDates[0] = new Date(eventsList[0].dateTime.dateStart).toString().slice(4, 10);
    tripDates[1] = new Date(eventsList[eventsList.length - 1].dateTime.dateEnd()).toString().slice(4, 10);
    return tripDates.join(`&nbsp;—&nbsp;`);
  }
});
