import AbstractComponent from './abstract-component';
import {typesOfTransport, countEventDuration, renderEventDuration} from '../utils';
import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

export default class Statistics extends AbstractComponent {
  constructor() {
    super();
    this._moneyCtx = this.getElement().querySelector(`.statistics__chart--money`);
    this._transportCtx = this.getElement().querySelector(`.statistics__chart--transport`);
    this._timeCtx = this.getElement().querySelector(`.statistics__chart--time`);
    this._moneyChart = null;
    this._transportChart = null;
    this._timeChart = null;
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
            minBarLength: 500,
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
            categoryPercentage: 1.0,
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

    const costs = [];
    for (const label of labels) {
      let labelCost = 0;
      this._events.map((event) => {
        if (label === event.type.toUpperCase()) {
          labelCost = labelCost + event.price;
        }
      });
      costs.push(labelCost);
    }

    this._moneyChart = this.renderChart(`MONEY`, this._moneyCtx, labels, costs);
  }

  renderTransportChart() {
    const labels = new Set();
    this._events.map((event) => {
      if (typesOfTransport.has(event.type)) {
        labels.add(event.type.toUpperCase());
      }
    });

    const counts = [];
    for (const label of labels) {
      let labelCount = 0;
      this._events.map((event) => {
        if (label === event.type.toUpperCase()) {
          labelCount = labelCount + 1;
        }
      });
      counts.push(labelCount);
    }

    this._transportChart = this.renderChart(`TRANSPORT`, this._transportCtx, [...labels], counts);
  }

  renderTimeChart() {
    const labels = [...new Set(this._events.map((event) => event.type.toUpperCase()))];

    const durations= [];
    for (const label of labels) {
      let labelDuration = 0;
      this._events.map((event) => {
        if (label === event.type.toUpperCase()) {
          const eventDuration = countEventDuration(event.dateStart, event.dateEnd);
          labelDuration = labelDuration ? labelDuration.add(eventDuration) : eventDuration;
        }
      });
      durations.push(labelDuration);
    }

    this._timeChart = this.renderChart(`TIME-SPEND`, this._timeCtx, labels, durations);
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
