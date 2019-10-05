import AbstractComponent from './abstract-component';
import moment from '../../../node_modules/moment/src/moment';

export default class Day extends AbstractComponent {
  constructor(date, dayIndex) {
    super();
    this._date = date;
    this._index = dayIndex;
  }

  getTemplate() {
    return `<li class="trip-days__item  day">
      <div class="day__info">
        <span class="day__counter">${this._index}</span>
        <time class="day__date" datetime="${this._date}">${this._date}</time>
      </div>

      <ul class="trip-events__list">
      </ul>
    </li>`;
  }
}
