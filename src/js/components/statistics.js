import {AbstractComponent} from './abstract-component';
import {typesOfTransport, countEventDuration, renderEventDuration} from '../utils';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export class Statistics extends AbstractComponent {
  constructor() {
    super();
    this._moneyCtx = this.getElement().querySelector(`.statistics__chart--money`);
    this._transportCtx = this.getElement().querySelector(`.statistics__chart--transport`);
    this._timeCtx = this.getElement().querySelector(`.statistics__chart--time`);
    this.moneyChart = null;
    this.transportChart = null;
    this.timeChart = null;
  }

  renderChart(title, container, labels, data) {
    Chart.defaults.global.defaultFontColor = `#000000`;
    Chart.defaults.global.defaultFontSize = 14;

    return new Chart(container, {
      plugins: [ChartDataLabels],
      type: `horizontalBar`,
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: `#ffffff`,
          hoverBackgroundColor: `#ffffff`
        }]
      },
      options: {
        plugins: {
          datalabels: {
            font: {
              size: 14
            },
            color: `#000000`,
            align: `start`,
            anchor: `end`,
            formatter(value) {
              if (title === `TIME-SPEND`) {
                return renderEventDuration(value);
              } else if (title === `TRANSPORT`) {
                return `${value}x`;
              } else {
                return `€ ${value}`;
              }
            }
          }
        },
        scales: {
          xAxes: [{
            // categoryPercentage: 1.0,
            // barThickness: 10,
            // maxBarThickness: 8,
            // minBarLength: 2,
            minBarLength: 400,
            gridLines: {
              display: false,
              drawBorder: false
            },
            ticks: {
              display: false
            }
          }],
          yAxes: [{
            barPercentage: 1.0,
            categoryPercentage: 1.0,  // если событий мало, то расстояние между полосками все равно будет гигантским
            barThickness: 50,
            maxBarThickness: 50,
            gridLines: {
              display: false,
              drawBorder: false
            }
          }]
        },
        legend: {
          display: false
        },
        layout: {
          padding: {
            left: 100,
            right: 50
          }
        },
        tooltips: {
          enabled: false
        },
        title: {
          display: true,
          position: `left`,
          text: title,
          padding: 10,
          fontSize: 20,
          fontColor: `#000000`,
          fontStyle: `bold`
        }
      }
    });
  }

  renderCharts(events) {
    this._events = events;
    this.renderMoneyChart();
    this.renderTransportChart();
    this.renderTimeChart();
  }

  renderMoneyChart() {
    const labels = [...new Set(this._events.map((event) => event.type.toUpperCase()))];
    // наверное нужно сортировать ивенты по убыванию цены, по количеству упоминаний и по длительности. В ТЗ не указано

    let data = [];
    labels.forEach((label) => {
      let labelCost = 0;
      this._events.map((event) => {
        if (label === event.type.toUpperCase()) {
          labelCost = labelCost + event.price;
          // было: при ховере после добавления нового ивента все пересчитывается почему-то в статистике
          // ПРО ХОВЕР - только если ошибка и ввели строку, вместо числа, например. Надо сделать защиту от ввода не в том формате
        }
      });
      data.push(labelCost);
    });

    this.moneyChart = this.renderChart(`MONEY`, this._moneyCtx, labels, data);
  }

  renderTransportChart() {
    let labels = new Set();
    this._events.map((event) => {
      if (typesOfTransport.has(event.type)) {
        labels.add(event.type.toUpperCase());
      }
    });

    let data = [];
    labels.forEach((label) => {
      let labelCount = 0;
      this._events.map((event) => {
        if (label === event.type.toUpperCase()) {
          labelCount = labelCount + 1;
        }
      });
      data.push(labelCount);
    });

    this.transportChart = this.renderChart(`TRANSPORT`, this._transportCtx, [...labels], data);
  }

  renderTimeChart() {
    const labels = [...new Set(this._events.map((event) => event.type.toUpperCase()))];

    let data = [];
    labels.forEach((label) => {
      let labelDuration = 0;
      this._events.map((event) => {
        if (label === event.type.toUpperCase()) {
          let eventDuration = countEventDuration(event.dateStart, event.dateEnd);
          if (labelDuration) {
            labelDuration = labelDuration.add(eventDuration);
          } else {
            labelDuration = eventDuration;
          }
        }
      });
      data.push(labelDuration);
    });

    this.timeChart = this.renderChart(`TIME-SPEND`, this._timeCtx, labels, data);
  }

  getTemplate() {
    return `<section class="statistics">
      <h2 class="visually-hidden">Trip statistics</h2>

      <div class="statistics__item statistics__item--money">
        <canvas class="statistics__chart  statistics__chart--money" width="900"></canvas>
      </div>

      <div class="statistics__item statistics__item--transport">
        <canvas class="statistics__chart  statistics__chart--transport" width="900"></canvas>
      </div>

      <div class="statistics__item statistics__item--time-spend">
        <canvas class="statistics__chart  statistics__chart--time" width="900"></canvas>
      </div>
    </section>`;
  }
}
