import {AbstractComponent} from './abstract-component';

const MESSAGES = {
  LOAD: `Loading...`,
  NO_EVENTS: `Click New Event to create your first point`,
};

export class Message extends AbstractComponent {
  constructor(message) {
    super();
    this._message = message;
  }

  getTemplate() {
    return `<p class="${this._message}-message" style="margin-left: 150px;">
    ${this._message === `load` ? MESSAGES.LOAD : MESSAGES.NO_EVENTS}</p>`;
  }
}
