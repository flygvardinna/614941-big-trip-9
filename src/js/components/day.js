import {AbstractComponent} from './abstract-component';
import moment from '../../../node_modules/moment/src/moment';

export class Day extends AbstractComponent {
  constructor(date, dayIndex) {
    super();
    this._date = date;
    this._dayIndex = dayIndex;
    // this._eventCount = eventCount;
  }

  getTemplate() {
    return `<li class="trip-days__item  day">
      <div class="day__info">
        <span class="day__counter">${this._dayIndex}</span>
        <time class="day__date" datetime="${moment(this._date).toISOString()}">${moment(this._date).format(`MMM DD`)}</time>
      </div>

      <ul class="trip-events__list">
      </ul>
    </li>`;
  }
}
