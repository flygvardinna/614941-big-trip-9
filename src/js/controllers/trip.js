import {Position, Mode, render, unrender, countEventDuration} from '../utils';
import {PointController} from './point';
import {Sort} from '../components/sort';
import {EventsList} from '../components/events-list';
import {Day} from '../components/day';
import {TripDetails} from '../components/trip-details';

const PointControllerMode = Mode;

export class TripController {
  constructor(container, onDataChange, destinations, offers) {
    this._container = container;
    this._onDataChange = onDataChange;
    this._events = [];
    this._destinations = destinations;
    this._offers = offers;
    this._sort = new Sort();
    this._eventsList = new EventsList();
    this._addingEvent = null;

    this._subscriptions = [];
    this._onChangeView = this._onChangeView.bind(this);
    // this._onDataChange = this._onDataChange.bind(this);
    this._info = document.querySelector(`.trip-info`);
    this._cost = this._info.querySelector(`.trip-info__cost-value`);
    this._details = false;

    this._init();
  }

  hide() {
    this._container.classList.add(`trip-events--hidden`);
  }

  show(events) {
    if (events !== this._events) {
      this._renderEvents(events);
    }

    this._container.classList.remove(`trip-events--hidden`);
  }

  addEvent() { // тоже сделать приватным?
    if (this._addingEvent) {
      return;
    }

    const defaultEvent = {
      type: `sightseeing`,
      destination: {
        name: ``,
        description: ``,
        pictures: []
      },
      dateStart: Date.now(),
      dateEnd: Date.now(),
      price: 0,
      offers: [],
      isFavorite: false
    };

    this._addingEvent = new PointController(this._sort.getElement(), defaultEvent, this._destinations, this._offers, PointControllerMode.ADDING,
        this._onChangeView, (...args) => {
          this._addingEvent = null;
          this._onDataChange(...args);
          // нужно закрывать форму создания точки, если открываем форму другой точки
        });
    // Из демки, в ТЗ ничего не указано, наверное, тоже так:
    // Новая карточка должна сразу отображаться в режиме редактирования и не закрываться по ESC (у меня это так и работает)
    // только у меня убирается обработчик эскейпа даже в том случае если он не был навешан (если форма добавления)
    // это можно поправить
    this._addingEvent._onChangeView();
    // ТЗ Одновременно может быть открыта только одна форма редактирования для одной точки маршрута.
    // Непонятно, если открыта форма создания новой точки и мы ждем на раскрытие другой точки, должна ли скрываться форма создания
  }

  _init() {
    const filter = document.querySelector(`.trip-filters`);

    render(this._container, this._sort.getElement(), Position.BEFOREEND);
    render(this._container, this._eventsList.getElement(), Position.BEFOREEND);
    // this._renderDays(this._events); // убрать это отсюда?

    // this._events.forEach((eventMock) => this._renderEvent(eventMock));

    this._sort.getElement()
    .addEventListener(`click`, (evt) => this._onSortItemClick(evt));

    filter.addEventListener(`click`, (evt) => this._onFilterClick(evt));
  }

  _renderEvents(events) {
    this._events = this._sortByStartDate(events);

    this._renderDays(this._events);
    if (this._details) {
      unrender(this._details.getElement());
    }
    this._details = new TripDetails(this._events);
    render(this._info, this._details.getElement(), Position.AFTERBEGIN);
    this._cost.innerHTML = this._countTripCost(this._events);
    // ? вынести это в отдельные функции чтобы вызывать их после изменения порядка событий и стоимости? (после onDataChange)
    // или просто каждый раз вызываем renderEvents?
  }

  _renderDays(eventsArray) {
    // unrender(this._eventsList.getElement()); // зачем это?
    // this._eventsList.removeElement(); // зачем это?
    this._eventsList.getElement().innerHTML = ``;

    let days = new Set();
    eventsArray.forEach((event) => {
      const date = new Date(event.dateStart).toString().slice(4, 10);
      if (!days.has(date)) {
        days.add(date);
      }
    });
    Array.from(days).forEach((day, index) => {
      const dayElement = new Day(day, index + 1).getElement();
      render(this._eventsList.getElement(), dayElement, Position.BEFOREEND);
      eventsArray.forEach((event) => {
        const eventDayStart = event.dateStart.toString().slice(4, 10); // здесь можно не отрезать, а сделать momentom как у дня
        if (day === eventDayStart) {
          const eventsContainer = dayElement.querySelector(`.trip-events__list`);
          this._renderEvent(eventsContainer, event);
        }
        // везде привести в порядок форматирование дат? сейчас у меня у дня в таблице дата в iso string
      });
    });
  }

  _renderEvent(container, event) {
    const pointController = new PointController(container, event, this._destinations, this._offers, PointControllerMode.DEFAULT, this._onChangeView, this._onDataChange);
    this._subscriptions.push(pointController.setDefaultView.bind(pointController));
  }

  _sortByStartDate(array) {
    return array.slice().sort((a, b) => {
      if (a.dateStart < b.dateStart) {
        return -1;
      }
      if (a.dateStart > b.dateStart) {
        return 1;
      }
      return 0;
    });
  }

  _countTripCost(eventsToSum) {
    let cost = 0;
    for (const event of eventsToSum) {
      let offersPrice = 0;
      for (const offer of event.offers) {
        if (offer.accepted) {
          offersPrice = offersPrice + offer.price;
        }
      }
      cost = cost + event.price + offersPrice;
    }
    return Math.floor(cost);
  }

  _onChangeView() {
    this._subscriptions.forEach((subscription) => subscription());
  }

  _onSortItemClick(evt) {
    if (evt.target.tagName !== `LABEL`) {
      return;
    }

    // Maybe this code should be separated in function applySorting which is called only when time or price sorting applied
    this._eventsList.getElement().innerHTML = ``;
    this._sort.getElement().querySelector(`.trip-sort__item--day`).innerHTML = ``;
    const dayElement = new Day(``, ``).getElement();
    render(this._eventsList.getElement(), dayElement, Position.BEFOREEND);
    dayElement.querySelector(`.day__info`).innerHTML = ``;
    const eventsContainer = dayElement.querySelector(`.trip-events__list`);

    switch (evt.target.dataset.sortType) {
      case `time-down`:
        const sortedByTimeDownEvents = this._events.slice().sort((a, b) => countEventDuration(b.dateStart, b.dateEnd) - countEventDuration(a.dateStart, a.dateEnd));
        sortedByTimeDownEvents.forEach((event) => this._renderEvent(eventsContainer, event, this._destinations, this._offers));
        break;
      case `price-down`:
        const sortedByPriceDownEvents = this._events.slice().sort((a, b) => b.price - a.price);
        sortedByPriceDownEvents.forEach((event) => this._renderEvent(eventsContainer, event, this._destinations, this._offers));
        break;
      case `default`:
        // render(this._container, this._tripDays.getElement(), Position.BEFOREEND);
        // this._events.forEach((eventMock) => this._renderEvent(eventMock));
        this._sort.getElement().querySelector(`.trip-sort__item--day`).innerHTML = `Day`;
        this._renderDays(this._events);
        break;
        // проблема с сортировкой, после изменения ивента снова отрисовываются дни, а не та сортировка, какая была
    }
  }

  _onFilterClick(evt) { // фильтры не работают на вкладке статитстика, это ок?
    evt.preventDefault();
    const dateToday = new Date();

    if (evt.target.tagName !== `LABEL`) {
      return;
    }

    switch (evt.target.innerHTML) {
      case `Future`:
        const futureEvents = [];
        this._events.map((event) => {
          if (new Date(event.dateStart) > dateToday) {
            futureEvents.push(event);
          }
        });
        this._renderDays(futureEvents);
        break;
      case `Past`:
        const pastEvents = [];
        this._events.map((event) => {
          if (new Date(event.dateEnd) < dateToday) {
            pastEvents.push(event);
          }
        });
        this._renderDays(pastEvents);
        break;
      case `Everything`:
        this._renderDays(this._events);
    }
  }
}
