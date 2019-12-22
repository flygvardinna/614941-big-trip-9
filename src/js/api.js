import ModelEvent from './model-event';

const Method = {
  GET: `GET`,
  POST: `POST`,
  PUT: `PUT`,
  DELETE: `DELETE`
};

export default class API {
  constructor({endPoint, authorization}) {
    this._endPoint = endPoint;
    this._authorization = authorization;
  }

  getDestinations() {
    return this._load({url: `destinations`})
      .then(API.toJSON);
  }

  getOffers() {
    return this._load({url: `offers`})
      .then(API.toJSON);
  }

  getEvents() {
    return this._load({url: `points`})
      .then(API.toJSON)
      .then(ModelEvent.parseEvents);
  }

  createEvent({event}) {
    return this._load({
      url: `points`,
      method: Method.POST,
      body: JSON.stringify(event),
      headers: new Headers({'Content-Type': `application/json`})
    })
      .then(API.toJSON)
      .then(ModelEvent.parseEvent);
  }

  updateEvent({id, event}) {
    return this._load({
      url: `points/${id}`,
      method: Method.PUT,
      body: JSON.stringify(event),
      headers: new Headers({'Content-Type': `application/json`})
    })
      .then(API.toJSON)
      .then(ModelEvent.parseEvent);
  }

  deleteEvent({id}) {
    return this._load({url: `points/${id}`, method: Method.DELETE});
  }

  _load({url, method = Method.GET, body = null, headers = new Headers()}) {
    headers.append(`Authorization`, this._authorization);

    return fetch(`${this._endPoint}/${url}`, {method, body, headers})
      .then(API.checkStatus)
      .catch((err) => {
        throw err;
      });
  }

  static toJSON(response) {
    return response.json();
  }

  static checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }

    throw new Error(`${response.status}: ${response.statusText}`);
  }
}
