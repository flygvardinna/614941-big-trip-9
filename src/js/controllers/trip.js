import {Position, Mode, render, countEventDuration} from '../utils';
import {PointController} from './point';
import {Sort} from '../components/sort';
import {EventsList} from '../components/events-list';
import {Day} from '../components/day';
import {TripDetails} from '../components/trip-details';

const PointControllerMode = Mode;

export class TripController {
  constructor(container, events) {
    this._container = container;
    // this._events = events;
    this._events = this._sortByStartDate(events);
    this._sort = new Sort();
    this._eventsList = new EventsList();
    // this._addingEvent = null;

    this._subscriptions = [];
    this._onChangeView = this._onChangeView.bind(this);
    this._onDataChange = this._onDataChange.bind(this);
  }

  init() {
    const tripInfo = document.querySelector(`.trip-info`);
    const tripCost = tripInfo.querySelector(`.trip-info__cost-value`);
    const filter = document.querySelector(`.trip-filters`);

    const tripDetails = new TripDetails(this._events);
    render(tripInfo, tripDetails.getElement(), Position.AFTERBEGIN);
    // TODO: fix getTripDetails function, dateEnd isn't correct sometimes
    tripCost.innerHTML = this._countTripCost(this._events);
    // ? вынести это в отдельные функции чтобы вызывать их после изменения порядка событий и стоимости?

    render(this._container, this._sort.getElement(), Position.BEFOREEND);
    render(this._container, this._eventsList.getElement(), Position.BEFOREEND);
    this._renderDays(this._events);

    // this._events.forEach((eventMock) => this._renderEvent(eventMock));

    this._sort.getElement()
    .addEventListener(`click`, (evt) => this._onSortItemClick(evt));

    filter.addEventListener(`click`, (evt) => this._onFilterClick(evt));
  }

  hide() {
    this._container.classList.add(`trip-events--hidden`);
  }

  show() {
    this._container.classList.remove(`trip-events--hidden`);
  }

  addEvent() {
    if (this._addingEvent) {
      return;
    }

    const defaultEvent = {
      type: `sightseeing`,
      destination: ``,
      dateStart: Date.now(),
      dateEnd: Date.now(),
      price: ``,
      offers() {
        return [];
      },
      description() {
        return ``;
      },
      pictures: []
    };
    this._addingEvent = new PointController(this._sort.getElement(), defaultEvent, PointControllerMode.ADDING,
        this._onChangeView, (...args) => {
          this._addingEvent = null;
          this._onDataChange(...args);
        });
    // this._events.push(defaultEvent);
    // const newEventForm = new EventAdd();
    // render(this._sort.getElement(), newEventForm.getElement(), Position.AFTEREND);
    // когда форму закрываем кнопка add New Event должна снова стать активной
    // форма ведет себя так же, как форма редактирования, то есть у нее должны быть те же функции по изменению данных
    // Из демки, в ТЗ ничего не указано, наверное, тоже так:
    // Новая карточка должна сразу отображаться в режиме редактирования и не закрываться по ESC (у меня это так и работает)
    // только у меня убирается обработчик эскейпа даже в том случае если он не был навешан (если форма добавления)
    // это можно поправить
  }

  _renderDays(eventsArray) {
    // unrender(this._eventsList.getElement()); // зачем это?
    // this._eventsList.removeElement(); // зачем это?
    this._eventsList.getElement().innerHTML = ``;

    let days = new Set();
    eventsArray.forEach((eventMock) => {
      const date = new Date(eventMock.dateStart).toString().slice(4, 10);
      if (!days.has(date)) {
        days.add(date);
      }
    });
    Array.from(days).forEach((day, index) => {
      const dayElement = new Day(day, index + 1).getElement();
      render(this._eventsList.getElement(), dayElement, Position.BEFOREEND);
      eventsArray.forEach((eventMock) => {
        const eventDayStart = new Date(eventMock.dateStart).toString().slice(4, 10);
        if (day === eventDayStart) {
          const eventsContainer = dayElement.querySelector(`.trip-events__list`);
          this._renderEvent(eventsContainer, eventMock);
        }
      });
    });
  }

  _renderEvent(container, event) {
    const pointController = new PointController(container, event, PointControllerMode.DEFAULT, this._onChangeView, this._onDataChange);
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
      cost = cost + event.price;
    }
    return Math.floor(cost);
    // TODO: count offers price also
  }

  _onChangeView() {
    this._subscriptions.forEach((subscription) => subscription());
  }

  _onDataChange(newData, oldData) {
    const index = this._events.findIndex((event) => event === oldData);
    // this._events = this._sortByStartDate(this._events); это не работает, потому что у измененного ивента в
    // dateStart записывается строка вида 2019-09-20 03:52 а у остальных - количество миллисекунд
    // НУЖНО ИСПРАВИТЬ, ИНАЧЕ НЕ БУДЕТ СОРТИРОВАТЬСЯ
    // ИТОГОВЫЕ ДАННЫЕ БУДУТ ПРИХОДИТЬ В ТАКОМ ЖЕ ФОРМАТЕ
    // ВИДИМО ДЛЯ СОРТИРОВКИ ИХ ТОЖЕ ПРИДЕТСЯ ПЕРЕВОДИТЬ В МИЛЛИСЕКУНДЫ

    // для новой точки это должно работать так же, как для старой.
    // но есть проблема в том, что в массиве ивентов нет записи для старой даты (точки с дефолтными значениями)
    // и получается индекс -1

    if (newData === null && oldData === null) {
      this._addingEvent = null;
    }

    if (newData === null) {
      this._events = [...this._events.slice(0, index), ...this._events.slice(index + 1)];
      // проблема такая, что у новой карточки получается индекс -1 и она не отрисовывается
    } else if (oldData === null) {
      this._addingEvent = null;
      this._events = [newData, ...this._events];
    } else {
      this._events[index] = newData;
    }

    this._events = this._sortByStartDate(this._events);
    this._renderDays(this._events);

    // При изменении дат (после кнопки save) должны перерендериваться duration (готово),
    // список дней (инфа о днях) - готово - и шапка с датами маршрута
    // TO DO После сохранения точка маршрута располагается в списке точек маршрута в порядке определенном
    // текущей сортировкой (по умолчанию, по длительности или по стоимости).
    // сейчас проблема такая, что если выбрана сортировка не по дням, то после изменения снова рендерятся дни
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
        // сейчас события по дням автоматически отсортированы по длительности, так как все заканчиваются в одни и те же день и время
        sortedByTimeDownEvents.forEach((eventMock) => this._renderEvent(eventsContainer, eventMock));
        break;
      case `price-down`:
        const sortedByPriceDownEvents = this._events.slice().sort((a, b) => b.price - a.price);
        sortedByPriceDownEvents.forEach((eventMock) => this._renderEvent(eventsContainer, eventMock));
        break;
      case `default`:
        // render(this._container, this._tripDays.getElement(), Position.BEFOREEND);
        // this._events.forEach((eventMock) => this._renderEvent(eventMock));
        this._sort.getElement().querySelector(`.trip-sort__item--day`).innerHTML = `Day`;
        this._renderDays(this._events);
        break;
    }
  }

  _onFilterClick(evt) {
    evt.preventDefault();
    const dateToday = Date.now();

    if (evt.target.tagName !== `INPUT`) {
      return;
    }

    switch (evt.target.value) {
      case `future`:
        const futureEvents = [];
        this._events.map((event) => {
          if (event.dateStart > dateToday) {
            futureEvents.push(event);
          }
        });
        this._renderDays(futureEvents);
        break;
      case `past`:
        const pastEvents = [];
        this._events.map((event) => {
          if (event.dateEnd < dateToday) {
            pastEvents.push(event);
          }
        });
        this._renderDays(pastEvents);
        break;
      case `everything`:
        this._renderDays(this._events);
    }
  }
}
