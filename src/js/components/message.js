import AbstractComponent from './abstract-component';

const MessageText = {
  LOAD: `Loading...`,
  NO_EVENTS: `Click New Event to create your first point`,
};

export default class Message extends AbstractComponent {
  constructor(message) {
    super();
    this._message = message;
  }

  getTemplate() {
    return `<p class="${this._message}-message" style="margin-left: 150px;">
    ${this._message === `load` ? MessageText.LOAD : MessageText.NO_EVENTS}</p>`;
  }
}
