import {AbstractComponent} from './abstract-component';

export class EventsList extends AbstractComponent {
  getTemplate() {
    return `<ul class="trip-days"></ul>`;
  }
}
