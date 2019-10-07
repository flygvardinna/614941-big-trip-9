import PointController from './point';
import Sorting from '../components/sorting';
import EventsList from '../components/events-list';
import Day from '../components/day';
import TripDetails from '../components/trip-details';
import Message from '../components/message';
import {Position, Mode, render, unrender, countEventDuration} from '../utils';
import moment from '../../../node_modules/moment/src/moment';

export default class TripController {
  constructor(container, onDataChange, destinations, offers) {
    this._container = container;
    this._onDataChange = onDataChange;
    this._events = [];
    this._destinations = destinations;
    this._offers = offers;
    this._sorting = new Sorting();
    this._sortedBy = `default`;
    this._eventsList = new EventsList();
    this._addingEvent = null;

    this._subscriptions = [];
    this._onChangeView = this._onChangeView.bind(this);
    this._info = document.querySelector(`.trip-info`);
    this._cost = this._info.querySelector(`.trip-info__cost-value`);
    this._details = false;
    this._noEventsMessage = null;

    this._init();
  }

  show(events) {
    this._cost.textContent = this._countTripCost(events);
    if (this._details) {
      unrender(this._details.getElement());
    }

    if (events.length === 0) {
      unrender(this._sorting.getElement());
      this._eventsList.getElement().innerHTML = ``;
      this._showNoEventsMessage();
      return;
    }

    if (events !== this._events) {
      this._events = this._sortByStartDate(events);

      this._details = new TripDetails(this._events);
      render(this._info, this._details.getElement(), Position.AFTERBEGIN);

      render(this._container, this._sorting.getElement(), Position.AFTERBEGIN);
      this._sorting.getElement().addEventListener(`click`, (evt) => this._onSortItemClick(evt));

      this._renderEvents(this._events);
    }
  }

  addEvent() {
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
      dateStart: new Date(),
      dateEnd: new Date(),
      price: 0,
      offers: [],
      isFavorite: false
    };

    if (this._noEventsMessage) {
      unrender(this._noEventsMessage.getElement());
    }

    const sorting = document.querySelector(`.trip-events__trip-sort`);
    const newPointPosition = sorting ? sorting : this._container;

    this._addingEvent = new PointController(newPointPosition, defaultEvent, this._destinations, this._offers, Mode.ADDING,
        this._onChangeView, (...args) => {
          this._addingEvent = null;
          this._onDataChange(...args);
        });
    this._addingEvent._onChangeView();
  }

  _init() {
    const filter = document.querySelector(`.trip-filters`);

    render(this._container, this._eventsList.getElement(), Position.BEFOREEND);
    filter.addEventListener(`click`, (evt) => this._onFilterClick(evt));
  }

  _renderEvents(events) {
    if (this._sortedBy === `default`) {
      this._renderDays(events);
    } else {
      this._applySorting(this._sortedBy, events);
    }
  }

  _renderDays(events) {
    this._eventsList.getElement().innerHTML = ``;

    const days = new Set();
    for (const event of events) {
      const date = moment(event.dateStart).format(`MMM DD`);
      days.add(date);
    }
    Array.from(days).forEach((day, index) => {
      const dayContainer = new Day(day, index + 1).getElement();
      render(this._eventsList.getElement(), dayContainer, Position.BEFOREEND);
      for (const event of events) {
        const eventDayStart = moment(event.dateStart).format(`MMM DD`);
        if (day === eventDayStart) {
          const eventsContainer = dayContainer.querySelector(`.trip-events__list`);
          this._renderEvent(eventsContainer, event);
        }
      }
    });
  }

  _renderEvent(container, event) {
    const pointController = new PointController(container, event, this._destinations, this._offers, Mode.DEFAULT, this._onChangeView, this._onDataChange);
    this._subscriptions.push(pointController.setDefaultView.bind(pointController));
  }

  _sortByStartDate(events) {
    return events.slice().sort((a, b) => {
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

  _renderDayContainerForAllEvents() {
    this._eventsList.getElement().innerHTML = ``;
    this._sorting.getElement().querySelector(`.trip-sort__item--day`).innerHTML = ``;
    const dayContainer = new Day(``, ``).getElement();
    render(this._eventsList.getElement(), dayContainer, Position.BEFOREEND);
    dayContainer.querySelector(`.day__info`).innerHTML = ``;
    return dayContainer.querySelector(`.trip-events__list`);
  }

  _applySorting(sorting, events) {
    switch (sorting) {
      case `time-down`:
        const container = this._renderDayContainerForAllEvents();
        const sortedByTimeDownEvents = events.sort((a, b) => countEventDuration(b.dateStart, b.dateEnd) - countEventDuration(a.dateStart, a.dateEnd));
        for (const event of sortedByTimeDownEvents) {
          this._renderEvent(container, event, this._destinations, this._offers);
        }
        break;
      case `price-down`:
        const eventsContainer = this._renderDayContainerForAllEvents();
        const sortedByPriceDownEvents = events.sort((a, b) => b.price - a.price);
        for (const event of sortedByPriceDownEvents) {
          this._renderEvent(eventsContainer, event, this._destinations, this._offers);
        }
        break;
      case `default`:
        this._sorting.getElement().querySelector(`.trip-sort__item--day`).innerHTML = `Day`;
        this._events = this._sortByStartDate(this._events);
        this._renderDays(this._events);
        break;
    }
  }

  _showNoEventsMessage() {
    this._noEventsMessage = new Message(`no-events`);
    render(this._container, this._noEventsMessage.getElement(), Position.BEFOREEND);
  }

  _onChangeView() {
    for (const subscription of this._subscriptions) {
      subscription();
    }
  }

  _onSortItemClick(evt) {
    if (evt.target.tagName !== `LABEL` || evt.target.dataset.sortType === this._sortedBy) {
      return;
    }

    this._sortedBy = evt.target.dataset.sortType;
    this._applySorting(this._sortedBy, this._events);
  }

  _onFilterClick(evt) {
    evt.preventDefault();

    const activeFilter = document.querySelector(`.trip-filters__filter-input[checked]`);
    const target = evt.target.textContent.toLowerCase();

    if (evt.target.tagName !== `LABEL` || target === activeFilter.value) {
      return;
    }

    const dateToday = new Date();
    activeFilter.removeAttribute(`checked`);
    evt.target.parentElement.querySelector(`.trip-filters__filter-input`).setAttribute(`checked`, `checked`);

    switch (target) {
      case `future`:
        const futureEvents = [];
        this._events.map((event) => {
          if (new Date(event.dateStart) > dateToday) {
            futureEvents.push(event);
          }
        });
        this._renderEvents(futureEvents);
        break;
      case `past`:
        const pastEvents = [];
        this._events.map((event) => {
          if (new Date(event.dateEnd) < dateToday) {
            pastEvents.push(event);
          }
        });
        this._renderEvents(pastEvents);
        break;
      case `everything`:
        this._renderEvents(this._events);
    }
  }
}
