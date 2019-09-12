import {AbstractComponent} from './abstract-component.js';

export class EventsList extends AbstractComponent {
  getTemplate() {
    return `<ul class="trip-days"></ul>`;
  }
}
