export class ModelOffer {
  constructor(data) {
    this.type = data[`type`];
    this.offers = data[`offers`] || [];
  }

  static parseOffer(data) {
    return new ModelOffer(data);
  }

  static parseOffers(data) {
    return data.map(ModelOffer.parseOffer);
  }
}
