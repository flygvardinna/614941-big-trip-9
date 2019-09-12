import {Position, render} from '../utils.js';
import {PointController} from './point.js';
import {Sort} from '../components/sort.js';
import {EventsList} from '../components/events-list.js';
import {Day} from '../components/day.js';

export class TripController {
  constructor(container, events) {
    this._container = container;
    this._events = events;
    this._sort = new Sort();
    this._eventsList = new EventsList();

    this._subscriptions = [];
    this._onChangeView = this._onChangeView.bind(this);
    this._onDataChange = this._onDataChange.bind(this);
  }

  init() {
    render(this._container, this._sort.getElement(), Position.AFTERBEGIN);
    render(this._container, this._eventsList.getElement(), Position.BEFOREEND);
    this._renderDays(this._events);

    // this._events.forEach((eventMock) => this._renderEvent(eventMock));

    this._sort.getElement()
    .addEventListener(`click`, (evt) => this._onSortItemClick(evt));
  }

  _renderDays(eventsArray) {
    // unrender(this._eventsList.getElement()); // зачем это?
    // this._eventsList.removeElement(); // зачем это?
    this._eventsList.getElement().innerHTML = ``;

    let days = new Set();
    eventsArray.forEach((eventMock) => {
      const date = new Date(eventMock.dateTime.dateStart).toString().slice(4, 10);
      if (!days.has(date)) {
        days.add(date);
      }
    });
    Array.from(days).forEach((day, index) => {
      const dayElement = new Day(day, index + 1).getElement();
      render(this._eventsList.getElement(), dayElement, Position.BEFOREEND);
      eventsArray.forEach((eventMock) => {
        const eventDayStart = new Date(eventMock.dateTime.dateStart).toString().slice(4, 10);
        if (day === eventDayStart) {
          const eventsContainer = dayElement.querySelector(`.trip-events__list`);
          this._renderEvent(eventsContainer, eventMock);
        }
      });
    });
  }

  _renderEvent(container, event) {
    const pointController = new PointController(container, event, this._onDataChange, this._onChangeView);
    this._subscriptions.push(pointController.setDefaultView.bind(pointController));
  }

  _onChangeView() {
    this._subscriptions.forEach((subscription) => subscription());
  }

  _onDataChange(newData, oldData) {
    this._events[this._events.findIndex((it) => it === oldData)] = newData;
    this._renderDays(this._events);
  }

  _onSortItemClick(evt) {
    if (evt.target.tagName !== `LABEL`) {
      return;
    }

    // Maybe this code should be separated in function applySorting which is called only when time or price sorting applied
    this._eventsList.getElement().innerHTML = ``;
    this._sort.getElement().querySelector(`.trip-sort__item--day`).innerHTML = ``;
    const dayElement = new Day(``, ``).getElement();
    render(this._eventsList.getElement(), dayElement, Position.BEFOREEND);
    dayElement.querySelector(`.day__info`).innerHTML = ``;
    const eventsContainer = dayElement.querySelector(`.trip-events__list`);

    switch (evt.target.dataset.sortType) {
      case `time-down`:
        const sortedByTimeDownEvents = this._events.slice().sort((a, b) => b.dateTime.duration(new Date(b.dateTime.dateStart), new Date(b.dateTime.dateEnd())).hours - a.dateTime.duration(new Date(a.dateTime.dateStart), new Date(a.dateTime.dateEnd())).hours);
        // TODO: fix duration sorting, not only by hours, but by days, then hours, then minuts
        sortedByTimeDownEvents.forEach((eventMock) => this._renderEvent(eventsContainer, eventMock));
        break;
      case `price-down`:
        const sortedByPriceDownEvents = this._events.slice().sort((a, b) => b.price - a.price);
        sortedByPriceDownEvents.forEach((eventMock) => this._renderEvent(eventsContainer, eventMock));
        break;
      case `default`:
        // render(this._container, this._tripDays.getElement(), Position.BEFOREEND);
        // this._events.forEach((eventMock) => this._renderEvent(eventMock));
        this._sort.getElement().querySelector(`.trip-sort__item--day`).innerHTML = `Day`;
        this._renderDays(this._events);
        break;
    }
  }
}
