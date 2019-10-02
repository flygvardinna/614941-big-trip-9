export class ModelEvent {
  constructor(data) {
    this.id = data[`id`];
    this.type = data[`type`];
    this.destination = data[`destination`];
    this.dateStart = new Date(data[`date_from`]); // нужно ли тут new Date
    this.dateEnd = new Date(data[`date_to`]);
    this.price = data[`base_price`];
    this.offers = data[`offers`] || [];
    this.isFavorite = Boolean(data[`is_favorite`]);
  }

  static parseEvent(data) {
    return new ModelEvent(data);
  }

  static parseEvents(data) {
    return data.map(ModelEvent.parseEvent);
  }
}
