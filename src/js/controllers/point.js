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
    this._mode = mode; // ниже замени просто mode на this._mode если надо. Пусть будет везде одинаково
    // возможно тут должны быть onEditButtonClick и onSubmitButtonClick
    // this._onSubmitButtonClick = this._onSubmitButtonClick.bind(this);

    this.init(mode);
  }

  init(mode) { // метод init слишком длинный, вынести все лишнее наружу? не получится, можно вынести в отдельные методы только
    let currentView = this._eventView;
    let renderPosition = Position.BEFOREEND;
    const noEventsMessage = document.querySelector(`.no-events-message`); //перенести в tripController?

    if (mode === Mode.ADDING) {
      currentView = this._eventEdit;
      renderPosition = Position.AFTEREND;
    }

    const minDateEnd = this._data.dateStart;
    const dateStartPicker = flatpickr(this._eventEdit.getElement().querySelector(`#event-start-time-1`), {
      altInput: true,
      allowInput: true,
      altFormat: `d/m/y H:i`,
      dateFormat: `Z`,
      defaultDate: this._data.dateStart,
      enableTime: true,
      'time_24hr': true,
      onChange(selectedDates, dateStr) {
        if (dateStr > minDateEnd.toISOString()) {
          dateEndPicker.set(`minDate`, dateStr);
          dateEndPicker.setDate(dateStr);
        }
      }
      // в ТЗ указан другой формат, не как в макетах, такой "d.m.Y H:i"
    });

    const dateEndPicker = flatpickr(this._eventEdit.getElement().querySelector(`#event-end-time-1`), {
      altInput: true,
      allowInput: true,
      altFormat: `d/m/y H:i`,
      dateFormat: `Z`,
      defaultDate: this._data.dateEnd,
      minDate: minDateEnd,
      enableTime: true,
      'time_24hr': true
    });

    const onSubmitButtonClick = (evt) => {
      evt.preventDefault();

      const form = this._eventEdit.getElement();
      const formData = new FormData(form);

      const picturesArray = Array.from(form.querySelectorAll(`.event__photo`)).map((picture) => ({
        src: picture.getAttribute(`src`),
        description: picture.getAttribute(`alt`)
      }));

      const offersArray = Array.from(form.querySelectorAll(`.event__offer-selector`)).map((offer) => ({
        title: offer.querySelector(`.event__offer-title`).textContent,
        price: Number(offer.querySelector(`.event__offer-price`).textContent),
        accepted: offer.querySelector(`.event__offer-checkbox`).checked
        // сломался выбор опций, нажимаешь save после изменения чекбоксов, не работает
      }));

      let destinationDescription = ``;
      if (form.querySelector(`.event__destination-description`)) {
        destinationDescription = form.querySelector(`.event__destination-description`).textContent;
      }

      this._data.type = formData.get(`event-type`);
      this._data.destination = {
        name: formData.get(`event-destination`),
        description: destinationDescription,
        pictures: picturesArray
      };
      this._data.dateStart = new Date(formData.get(`event-start-time`));
      this._data.dateEnd = new Date(formData.get(`event-end-time`));
      this._data.price = Number(formData.get(`event-price`));
      this._data.offers = offersArray;
      if (mode === Mode.DEFAULT) {
        this._data.isFavorite = form.querySelector(`.event__favorite-checkbox`).checked;
      }
      this._data.toRAW = () => {
        return {
          id: this._data.id,
          type: this._data.type,
          destination: this._data.destination,
          date_from: this._data.dateStart,
          date_to: this._data.dateEnd,
          base_price: this._data.price,
          offers: this._data.offers,
          is_favorite: this._data.isFavorite,
        };
      }

      this.toggleFormBlock(form, `save`, true);

      // сейчас при изменении опции (выбранная) не отрисовывается в списке ивентов (не в форме)
      // Отрисовывается при сохранении, без сохранения нет, это ок. Но если кликнуть и не сохранить, то она визуально остается
      // голубой чекнутой

      if (mode === Mode.DEFAULT) {
        this._onDataChange(`update`, this._data, this.onError.bind(this, `save`));
      } else {
        this._onDataChange(`create`, this._data, this.onError.bind(this, `save`), this.onSuccesEventCreate.bind(this)); //убрать последнее?
      }

      document.removeEventListener(`keydown`, onEscKeyDown); // ТОЖЕ ДОЛЖНО УБИРАТЬСЯ ТОЛЬКО ПРИ УСПЕХЕ?
    };

    const onEscKeyDown = (evt) => {
      if (evt.key === Key.ESCAPE || evt.key === Key.ESCAPE_IE) {
        if (this._container.contains(this._eventEdit.getElement())) {
          this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
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

      // Если в форме что-то поменяли, например, удалили данные инпута, возникла ошибка и форма не отправлена,
      // то если нажать Esc или стрелочку форма закроется в измененном виде, при повторном открытии останется красная
      // обводка (это легко убрать) и данные будут изменены, хотя у eventView все будет в исходном виде
      // СЕРЬЕЗНЫЙ КОСЯК

    if (mode === Mode.DEFAULT) {
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
        this._eventEdit._onDestinationChange(this._eventEdit.getElement(), evt.target);
      });

    this._eventEdit.getElement().querySelector(`.event__reset-btn`)
      .addEventListener(`click`, () => {
        this.toggleFormBlock(this._eventEdit.getElement(), `delete`, true);
        this._onDataChange(`delete`, this._data, this.onError.bind(this, `delete`));

        if (mode === Mode.ADDING) {
          unrender(this._eventEdit.getElement());
          document.querySelector(`.trip-main__event-add-btn`).removeAttribute(`disabled`);
          // этот код дублируется внизу в onSuccesEventCreate, разберись. можно вынести в отдельную функцию Закрыть форму редактирования
        }
      });

    if (noEventsMessage) {
      unrender(noEventsMessage);
    }
    render(this._container, currentView.getElement(), renderPosition);
  }

  toggleFormBlock(form, button, value) {
    const style = this._eventEdit.getElement().getAttribute(`style`);
    if (style) {
      this._eventEdit.getElement().style = `border: none`;
    }
    if (button === `save`) {
      form.querySelector(`.event__save-btn`).textContent = value ? `Saving...` : `Save`;
    } else {
      form.querySelector(`.event__reset-btn`).textContent = value ? `Deleting...` : `Delete`;
    }
    form.querySelector(`.event__type-toggle`).disabled = value;
    form.querySelector(`.event__save-btn`).disabled = value;
    form.querySelector(`.event__reset-btn`).disabled = value;
    Array.from(form.querySelectorAll(`.event__input`)).map((input) => input.disabled = value);
    Array.from(form.querySelectorAll(`.event__offer-checkbox`)).map((offer) => offer.disabled = value);
    if (this._mode === Mode.DEFAULT) {
      form.querySelector(`.event__favorite-checkbox`).disabled = value;
      form.querySelector(`.event__rollup-btn`).disabled = value;
    }
  }

  shake() {
    const ANIMATION_TIMEOUT = 600;
    this._eventEdit.getElement().style.animation = `shake ${ANIMATION_TIMEOUT / 1000}s`;

    setTimeout(() => {
      this._eventEdit.getElement().style.animation = ``
    }, ANIMATION_TIMEOUT);
  }

  setDefaultView() {
    if (this._container.contains(this._eventEdit.getElement())) {
      this._container.replaceChild(this._eventView.getElement(), this._eventEdit.getElement());
    }
  }

  onError(string) {
    this.toggleFormBlock(this._eventEdit.getElement(), string, false);
    this._eventEdit.getElement().style = `border: 3px red solid`;
    this.shake();
  }

  onSuccesEventCreate() {
    unrender(this._eventEdit.getElement());
    document.querySelector(`.trip-main__event-add-btn`).removeAttribute(`disabled`);
    // код дублируется выше если делаем кансель на создании объекта, вынести в отдельную функцию?
      // ПРОБЛЕМА - ЕСЛИ ПРИ СОЗДАНИИ ИВЕНТА ОШИБКА, ТО ФОРМА ИСЧЕЗАЕТ И НЕ СРАБАТЫВАЕТ НОРМАЛЬНО ON ERROR. НЕПОНЯТНО, ОСТАЛОСЬ ИЛИ НЕТ
  }
}
