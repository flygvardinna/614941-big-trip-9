import {Position, Key, render} from '../utils.js';
import {Sort} from '../components/sort.js';
import {TripDays} from '../components/trip-days.js';
import {Event} from '../components/event.js';
import {EventEdit} from '../components/event-edit.js';

export class TripController {
  constructor(container, events) {
    this._container = container;
    this._events = events;
    this._sort = new Sort();
    this._tripDays = new TripDays(events);
    this._dayEventsList = this._tripDays.getElement().querySelector(`.trip-events__list`);
  }

  init() {
    render(this._container, this._sort.getElement(), Position.AFTERBEGIN);
    render(this._container, this._tripDays.getElement(), Position.BEFOREEND);

    this._events.forEach((eventMock) => this._renderEvent(eventMock));

    this._sort.getElement()
    .addEventListener(`click`, (evt) => this._onSortItemClick(evt));
  }

  _renderEvent(eventMock) {
    const eventComponent = new Event(eventMock);
    const eventEditComponent = new EventEdit(eventMock);


    const onEscKeyDown = (evt) => {
      if (evt.key === Key.ESCAPE || evt.key === Key.ESCAPE_IE) {
        this._dayEventsList.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    eventComponent.getElement()
      .querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, () => {
        this._dayEventsList.replaceChild(eventEditComponent.getElement(), eventComponent.getElement());
        document.addEventListener(`keydown`, onEscKeyDown);
      });

    eventEditComponent.getElement()
      .addEventListener(`submit`, () => {
        this._dayEventsList.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    eventEditComponent.getElement()
      .querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, () => {
        this._dayEventsList.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    render(this._dayEventsList, eventComponent.getElement(), Position.BEFOREEND);
  }

  _onSortItemClick(evt) {
    if (evt.target.tagName !== `LABEL`) {
      return;
    }

    this._dayEventsList.innerHTML = ``;

    switch (evt.target.dataset.sortType) {
      case `time-down`:
        const sortedByTimeDownEvents = this._events.slice().sort((a, b) => b.dateTime.duration(new Date(b.dateTime.dateStart), new Date(b.dateTime.dateEnd())).hours - a.dateTime.duration(new Date(a.dateTime.dateStart), new Date(a.dateTime.dateEnd())).hours);
        // TODO: fix duration sorting, not only by hours, but by days, then hours, then minuts
        sortedByTimeDownEvents.forEach((eventMock) => this._renderEvent(eventMock));
        break;
      case `price-down`:
        const sortedByPriceDownEvents = this._events.slice().sort((a, b) => b.price - a.price);
        sortedByPriceDownEvents.forEach((eventMock) => this._renderEvent(eventMock));
        break;
      case `default`:
        render(this._container, this._tripDays.getElement(), Position.BEFOREEND);
        this._events.forEach((eventMock) => this._renderEvent(eventMock));
        break;
    }
  }
}
