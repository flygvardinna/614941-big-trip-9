import AbstractComponent from './abstract-component';

export default class EventsList extends AbstractComponent {
  getTemplate() {
    return `<ul class="trip-days"></ul>`;
  }
}
