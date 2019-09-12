import {Position, Key, render, shuffleArray} from '../utils.js';
import {Event} from '../components/event.js';
import {EventEdit} from '../components/event-edit.js';

export class PointController {
  constructor(container, data, onDataChange, onChangeView) {
    this._container = container;
    this._data = data;
    this._onChangeView = onChangeView;
    this._onDataChange = onDataChange;
    this._eventView = new Event(data);
    this._eventEdit = new EventEdit(data);

    this.init();
  }

  init() {
    const onEscKeyDown = (evt) => {
      if (evt.key === Key.ESCAPE || evt.key === Key.ESCAPE_IE) {
        this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    this._eventView.getElement()
      .querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, () => {
        this._onChangeView();
        this._container.replaceChild(this._eventEdit.getElement(), this._eventView.getElement());
        document.addEventListener(`keydown`, onEscKeyDown);
      });

    this._eventEdit.getElement()
      .addEventListener(`submit`, (evt) => {
        evt.preventDefault();

        const formData = new FormData(this._eventEdit.getElement());
        const entry = {
          type: formData.get(`event-type`),
          destination: formData.get(`event-destination`),
          dateTime: {
            dateStart: formData.get(`event-start-time`),
            dateEnd: formData.get(`event-end-time`), // разберись, почему получается Invalid data после сохранения
            duration() {
              const duration = (this.dateEnd - this.dateStart) / (60 * 60 * 1000); // тут тоже должна быть другая функция, из этой даты нельзя вычесть
              return {
                hours: Math.trunc(duration),
                minuts() {
                  return Math.round((duration - this.hours) * 60);
                },
              };
            }
          },
          price: formData.get(`event-price`),
          offers() {
            let offersList = [
              {name: `Add luggage`,
                price: 10,
                selected: Boolean(Math.round(Math.random()))},
              {name: `Switch to comfort class`,
                price: 150,
                selected: Boolean(Math.round(Math.random()))},
              {name: `Add meal`,
                price: 2,
                selected: Boolean(Math.round(Math.random()))},
              {name: `Choose seats`,
                price: 9,
                selected: Boolean(Math.round(Math.random()))},
            ];
            const offersCount = Math.floor(Math.random() * 3);
            return shuffleArray(offersList).slice(0, offersCount);
          },
          // мне нужно собирать объект с полным списком опций и информацией о том, какие отмечены, а какие нет
        };

        this._onDataChange(entry, this._data);
        // может можно было не городить поиск лейбла с типом итд, а брать entry.type итд
        // TO DO После сохранения точка маршрута располагается в списке точек маршрута в порядке определенном
        // текущей сортировкой (по умолчанию, по длительности или по стоимости).

        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    this._eventEdit.getElement()
      .querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, () => {
        this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      });

    Array.from(this._eventEdit.getElement().querySelectorAll(`.event__type-input`)).forEach((option) => {
      option.addEventListener(`click`, (evt) => {
        this._eventEdit._onEventTypeChange(this._eventEdit.getElement(), evt.target.getAttribute(`value`));
      });
    });

    this._eventEdit.getElement()
      .querySelector(`.event__input--destination`) // возможно, надо отслеживать изменение не input а тега datalist
      .addEventListener(`change`, () => this._eventEdit._onDestinationChange(this._eventEdit.getElement()));

    render(this._container, this._eventView.getElement(), Position.BEFOREEND);
  }

  setDefaultView() {
    if (this._container.contains(this._eventEdit.getElement())) {
      this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
    }
  }
}
