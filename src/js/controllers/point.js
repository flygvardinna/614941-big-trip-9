import {Position, Mode, Key, render, unrender} from '../utils';
import {Event} from '../components/event';
import {EventEdit} from '../components/event-edit';
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
    // возможно тут должны быть onEditButtonClick и onSubmitButtonClick
    // this._onSubmitButtonClick = this._onSubmitButtonClick.bind(this);

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
      // dateFormat: `U`, // выводились в value милисекунды
      dateFormat: `Z`,
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
      dateFormat: `Z`,
      // dateFormat: `d/m/y H:i`,
      defaultDate: this._data.dateEnd,
      minDate: minDateEnd,
      enableTime: true,
      // time_24hr: true
    });

    const onSubmitButtonClick = (evt) => {
      evt.preventDefault();

      const form = this._eventEdit.getElement();
      const formData = new FormData(form);
      let picturesArray = [];
      Array.from(form.querySelectorAll(`.event__photo`)).forEach((picture) => picturesArray.push({
        src: picture.getAttribute(`src`),
        description: picture.getAttribute(`alt`)
      }));
      let offersArray = [];
      Array.from(form.querySelectorAll(`.event__offer-selector`)).forEach((offer) => offersArray.push({
        title: offer.querySelector(`.event__offer-title`).innerHTML,
        price: parseInt(offer.querySelector(`.event__offer-price`).innerHTML, 10),
        accepted: offer.querySelector(`.event__offer-checkbox`).checked
      }));

      this._data.type = formData.get(`event-type`); // нужно ли передавать id?
      this._data.destination = {
        name: formData.get(`event-destination`),
        description: form.querySelector(`.event__destination-description`).innerHTML,
        pictures: picturesArray
      };
      this._data.dateStart = new Date(formData.get(`event-start-time`));
      this._data.dateEnd = new Date(formData.get(`event-end-time`));
      this._data.price = parseInt(formData.get(`event-price`), 10);
      this._data.offers = offersArray;
      this._data.isFavorite = form.querySelector(`.event__favorite-checkbox`).checked;

      // сейчас при изменении опции (выбранная) не отрисовывается в списке ивентов (не в форме)

      // может можно было не городить поиск лейбла с типом итд, а брать entry.type итд
      // TO DO После сохранения точка маршрута располагается в списке точек маршрута в порядке определенном
      // текущей сортировкой (по умолчанию, по длительности или по стоимости). НЕ РАБОТАЕТ СЕЙЧАС
      // сейчас проблема такая, что если выбрана сортировка не по дням, то после изменения снова рендерятся дни

      this._onDataChange(`update`, this._data);

      document.removeEventListener(`keydown`, onEscKeyDown);

      if (mode === Mode.ADDING) {
        unrender(this._eventEdit.getElement());
        document.querySelector(`.trip-main__event-add-btn`).removeAttribute(`disabled`);
      }
    };

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

    const updateIfOfferAccepted = () => {
      const offers = Array.from(this._eventEdit.getElement().querySelectorAll(`.event__offer-checkbox`));
      offers.forEach((offer) => {
        offer.addEventListener(`click`, () => {
          // нужно вызывать пересчитывание стоимости путешествия после сохранения данных? Или само посчитается?
          if (offer.checked === true) {
            offer.setAttribute(`checked`, `checked`);
          } else {
            offer.setAttribute(`checked`, false);
          }
        });
      });
    };

    updateIfOfferAccepted();

    this._eventEdit.getElement()
      .addEventListener(`submit`, onSubmitButtonClick);

    this._eventView.getElement()
      .querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, () => {
        this._onChangeView();
        this._container.replaceChild(this._eventEdit.getElement(), this._eventView.getElement());
        document.addEventListener(`keydown`, onEscKeyDown);
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
  }

  setDefaultView() {
    if (this._container.contains(this._eventEdit.getElement())) {
      this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
    }
  }
}
