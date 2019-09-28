import {Position, Mode, Key, render, unrender, shuffleArray} from '../utils';
import {Event} from '../components/event';
import {EventEdit} from '../components/event-edit';
// import {EventAdd} from '../components/event-add';
import flatpickr from 'flatpickr';

export class PointController {
  constructor(container, data, destinations, offers, mode, onChangeView, onDataChange) {
    this._container = container;
    this._data = data;
    this._destinations = destinations;
    this._offers = offers;
    this._onChangeView = onChangeView;
    this._onDataChange = onDataChange;
    this._eventView = new Event(this._data);
    this._eventEdit = new EventEdit(mode, this._data, this._destinations, this._offers);

    this.init(mode);
  }

  init(mode) {
    let currentView = this._eventView;
    let renderPosition = Position.BEFOREEND;

    if (mode === Mode.ADDING) {
      // this._eventEdit = new EventAdd(this._data);
      currentView = this._eventEdit;
      renderPosition = Position.AFTEREND;
    }

    // нужно подключить флетпикер и для новой формы добавления
    let minDateEnd = this._data.dateStart;
    flatpickr(this._eventEdit.getElement().querySelector(`#event-start-time-1`), {
      altInput: true,
      allowInput: true,
      altFormat: `d/m/y H:i`,
      // dateFormat: `Y-m-d H:i`,
      dateFormat: `U`,
      defaultDate: this._data.dateStart,
      // minDate: `today`,
      enableTime: true,
      // time_24hr: true,
      onChange(selectedDates, dateStr) {
        minDateEnd = dateStr; // как переопределить дату для второго пикера? пока не получилось
      }
      // в ТЗ указан другой формат, не как в макетах, такой "d.m.Y H:i"
      // Дата окончания не может быть меньше даты начала события. У меня пока при изменения даты начала это не работает
    });

    flatpickr(this._eventEdit.getElement().querySelector(`#event-end-time-1`), {
      altInput: true,
      allowInput: true,
      altFormat: `d/m/y H:i`,
      // dateFormat: `Y-m-d H:i`,
      dateFormat: `U`,
      defaultDate: this._data.dateEnd,
      minDate: minDateEnd,
      enableTime: true,
      // time_24hr: true
    });

    const onEscKeyDown = (evt) => {
      if (evt.key === Key.ESCAPE || evt.key === Key.ESCAPE_IE) {
        if (mode === Mode.DEFAULT) {
          if (this._container.contains(this._eventEdit.getElement())) {
            this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
          }
        } else if (mode === Mode.ADDING) {
          this._container.removeChild(currentView.getElement());
        }
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
          dateStart: formData.get(`event-start-time`) * 1000,
          dateEnd: formData.get(`event-end-time`) * 1000,
          price: parseInt(formData.get(`event-price`), 10),
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

        //ПЕРЕПИСАТЬ this._onDataChange(entry, mode === Mode.DEFAULT ? this._data : null);
        this._onDataChange(`update`, entry, mode === Mode.DEFAULT ? this._data : null);
        // может можно было не городить поиск лейбла с типом итд, а брать entry.type итд
        // TO DO После сохранения точка маршрута располагается в списке точек маршрута в порядке определенном
        // текущей сортировкой (по умолчанию, по длительности или по стоимости).

        document.removeEventListener(`keydown`, onEscKeyDown);

        if (mode === Mode.ADDING) {
          unrender(form);
          document.querySelector(`.trip-main__event-add-btn`).removeAttribute(`disabled`);
        }
      });

    if (mode === Mode.DEFAULT) {
      // нужно закрывать форму создания точки, если открываем форму другой точки
      // через onChangeView?
      this._eventEdit.getElement()
        .querySelector(`.event__rollup-btn`)
        .addEventListener(`click`, () => {
          this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
          document.removeEventListener(`keydown`, onEscKeyDown);
        });
    }

    Array.from(this._eventEdit.getElement().querySelectorAll(`.event__type-input`)).forEach((option) => {
      option.addEventListener(`click`, () => {
        if (this._data.type !== option.value) {
          this._data.type = option.value;
          option.closest(`.event__type-wrapper`).querySelector(`.event__type-toggle`).checked = false;
          this._eventEdit._onEventTypeChange(this._eventEdit.getElement(), option.value);
        }
      });
    });

    this._eventEdit.getElement()
      .querySelector(`.event__input--destination`)
      .addEventListener(`change`, (evt) => {
        // let value = evt.target.value;
        this._eventEdit._onDestinationChange(this._eventEdit.getElement(), evt.target.value);
      });

    this._eventEdit.getElement().querySelector(`.event__reset-btn`)
      .addEventListener(`click`, () => {
        this._onDataChange(`delete`, this._data);

        if (mode === Mode.ADDING) {
          unrender(this._eventEdit.getElement());
          document.querySelector(`.trip-main__event-add-btn`).removeAttribute(`disabled`);
          // этот код дублируется выше, можно вынести в отдельную функцию Закрыть форму редактирования
          // Сейчас Cancel на форме добавления приводит к тому, что отрисовываются еще 5 событий
        }
      });

    render(this._container, currentView.getElement(), renderPosition);
    // сделай функцию, чтобы опции в форме можно было отщелкнуть и сделать не селектед
  }

  setDefaultView() {
    if (this._container.contains(this._eventEdit.getElement())) {
      this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
    }
  }
}
