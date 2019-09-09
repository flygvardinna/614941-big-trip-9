import {Position, Key, render} from '../utils.js';
import {TripDays} from '../components/trip-days.js';
import {Event} from '../components/event.js';
import {EventEdit} from '../components/event-edit.js';

export class TripController {
  constructor(container, events) {
    this._container = container;
    this._events = events;
    this._tripDays = new TripDays(events);
  }

  init() {
    render(this._container, this._tripDays.getElement(), Position.BEFOREEND);
    this._events.forEach((eventMock) => this._renderEvent(eventMock));
  }

  _renderEvent(eventMock) {
    const eventComponent = new Event(eventMock);
    const eventEditComponent = new EventEdit(eventMock);
    const dayEventsList = this._tripDays.getElement().querySelector(`.trip-events__list`);

    const onEscKeyDown = (evt) => {
      if (evt.key === Key.ESCAPE || evt.key === Key.ESCAPE_IE) {
        dayEventsList.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    eventComponent.getElement()
      .querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, () => {
        dayEventsList.replaceChild(eventEditComponent.getElement(), eventComponent.getElement());
        document.addEventListener(`keydown`, onEscKeyDown);
      });

    eventEditComponent.getElement()
      .addEventListener(`submit`, () => {
        dayEventsList.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    eventEditComponent.getElement()
      .querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, () => {
        dayEventsList.replaceChild(eventComponent.getElement(), eventEditComponent.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    render(dayEventsList, eventComponent.getElement(), Position.BEFOREEND);
  }
}
