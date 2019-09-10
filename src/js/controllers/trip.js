import {Position, Key, render} from '../utils.js';
import {Sort} from '../components/sort.js';
import {EventsList} from '../components/events-list.js';
import {Day} from '../components/day.js';
import {Event} from '../components/event.js';
import {EventEdit} from '../components/event-edit.js';

export class TripController {
  constructor(container, events) {
    this._container = container;
    this._events = events;
    this._sort = new Sort();
    this._eventsList = new EventsList();
    // this._tripDays = new TripDays(events);
    // this._dayEventsList = this._tripDays.getElement().querySelector(`.trip-events__list`);
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

  /* _renderEventsList(events) {
    unrender(this._dayEventsList);

    this._dayEventsList.removeElement();
    render(this._container, this._tripDays.getElement(), Position.BEFOREEND);
    this._events.forEach((eventMock) => this._renderEvent(eventMock));
  } */

  _renderEvent(dayContainer, eventMock) {
    const eventComponent = new Event(eventMock);
    const eventEditComponent = new EventEdit(eventMock);

    const onEscKeyDown = (evt) => {
      if (evt.key === Key.ESCAPE || evt.key === Key.ESCAPE_IE) {
        dayContainer.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    eventComponent.getElement()
      .querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, () => {
        dayContainer.replaceChild(eventEditComponent.getElement(), eventComponent.getElement());
        document.addEventListener(`keydown`, onEscKeyDown);
      });

    eventEditComponent.getElement()
      .addEventListener(`submit`, (evt) => {
        evt.preventDefault();

        const formData = new FormData(eventEditComponent.getElement()); // заменить на this?
        const entry = {
          type: formData.get(`event-type`),
          destination: formData.get(`event-destination`),
          dateTime: {
            dateStart: formData.get(`event-start-time`),
            dateEnd: formData.get(`event-end-time`)
          },
          price: formData.get(`event-price`),
          // offers: Array.from(formData.getAll(`event-offer`)), доработать
        };

        this._events[this._events.findIndex((it) => it === event)] = entry;

        this._renderEventsList(this._events);
        // this._dayEventsList.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    eventEditComponent.getElement()
      .querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, () => {
        dayContainer.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    render(dayContainer, eventComponent.getElement(), Position.BEFOREEND);
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
