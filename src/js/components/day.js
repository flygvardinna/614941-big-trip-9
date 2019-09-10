import {AbstractComponent} from './abstract-component.js';

export class Day extends AbstractComponent {
  constructor(date, dayIndex) {
    super();
    this._date = new Date(date);
    this._dayIndex = dayIndex;
    // this._eventCount = eventCount;
  }

  getTemplate() {
    return `<li class="trip-days__item  day">
      <div class="day__info">
        <span class="day__counter">${this._dayIndex}</span>
        <time class="day__date" datetime="${this._date}">${this._date.toString().slice(4, 10)}</time>
      </div>

      <ul class="trip-events__list">
      </ul>
    </li>`;
  }
}
