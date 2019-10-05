import AbstractComponent from './abstract-component';

const MessageText = {
  LOAD: `Loading...`,
  NO_EVENTS: `Click New Event to create your first point`,
};

export default class Message extends AbstractComponent {
  constructor(content) {
    super();
    this._content = content;
  }

  getTemplate() {
    return `<p class="${this._message}-message" style="margin-left: 150px;">
    ${this._content === `load` ? MessageText.LOAD : MessageText.NO_EVENTS}</p>`;
  }
}
