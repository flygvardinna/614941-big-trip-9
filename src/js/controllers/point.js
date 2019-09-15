import {Position, Key, render, shuffleArray} from '../utils';
import {Event} from '../components/event';
import {EventEdit} from '../components/event-edit';
import flatpickr from 'flatpickr';

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
    let minDateEnd = this._data.dateStart;
    flatpickr(this._eventEdit.getElement().querySelector(`#event-start-time-1`), {
      altInput: true,
      allowInput: true,
      altFormat: `d/m/y H:i`,
      dateFormat: `Y-m-d H:i`,
      defaultDate: this._data.dateStart,
      minDate: `today`,
      enableTime: true,
      // time_24hr: true,
      onChange(selectedDates, dateStr) {
        minDateEnd = dateStr; // как переопределить дату для второго пикера? пока не получилось
      }
      // в ТЗ указан другой формат, не как в макетах, такой "d.m.Y H:i"
      // Дата окончания не может быть меньше даты начала события.
      // Наверное при смене даты, время не должно автоматически обнуляться тоже
    });

    flatpickr(this._eventEdit.getElement().querySelector(`#event-end-time-1`), {
      altInput: true,
      allowInput: true,
      altFormat: `d/m/y H:i`,
      dateFormat: `Y-m-d H:i`,
      defaultDate: this._data.dateEnd,
      minDate: minDateEnd,
      enableTime: true,
      // time_24hr: true
    });

    const onEscKeyDown = (evt) => {
      if (evt.key === Key.ESCAPE || evt.key === Key.ESCAPE_IE) {
        this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };

    const checkSelectedType = (type) => {
      const options = Array.from(this._eventEdit.getElement().querySelectorAll(`.event__type-input`));
      options.forEach((option) => {
        if (option.getAttribute(`value`) === type) {
          option.setAttribute(`checked`, `checked`);
        }
      });
    };

    checkSelectedType(this._data.type);

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

        const form = this._eventEdit.getElement();
        const formData = new FormData(form);
        let picturesArray = [];
        Array.from(form.querySelectorAll(`.event__photo`)).forEach((picture) => picturesArray.push(picture.getAttribute(`src`)));
        const entry = {
          type: formData.get(`event-type`),
          destination: formData.get(`event-destination`),
          dateStart: formData.get(`event-start-time`),
          dateEnd: formData.get(`event-end-time`),
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
          description() {
            return form.querySelector(`.event__destination-description`).innerHTML;
          },
          pictures: picturesArray
          // мне нужно собирать объект с полным списком опций и информацией о том, какие отмечены, а какие нет
          // видимо, нужно хранить id опций и инфу чекнуты или нет, а цена привязана к id
          // и в шаблоне опции нужно менять name, id итд при вставке опций
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
