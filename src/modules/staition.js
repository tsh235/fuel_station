import {Column} from './column.js';
import {RenderStation} from './renderStation.js';

export class Station {
  #queue = [];
  #filling = [];
  #ready = [];
  constructor(typeStation, renderApp = null) {
    console.log('typeStation: ', typeStation);
    this.typeStation = typeStation;
    this.renderApp = renderApp;
    this.renderStation = null;
  }

  get filling() {
    return this.#filling;
  }

  get queue() {
    return this.#queue;
  }

  init() {
    this.addOptionsToOptionStation(this.typeStation);
    this.addFilling(this.typeStation);
    this.addStation(this.renderApp);

    setInterval(() => {
      this.checkQueueToFilling();
    }, 2000);
  }

  addStation(app) {
    if (app) {
      this.renderStation = new RenderStation(app, this);
    }
  }

  addFilling(station) {
    for (const optionStation of station) {
      for (let i = 0; i < optionStation.count; i++) {
        this.#filling.push(new Column(optionStation.type, optionStation.speed));
      }
    }
  }

  addOptionsToOptionStation(data) {
    for (let i = 0; i < data.length; i++) {
      if (!('count' in data[i])) {
        data[i]['count'] = 1;
      }
      if (!('speed' in data[i])) {
        data[i]['speed'] = 5;
      }
    }

    this.typeStation = data;
    return this.typeStation;
  }

  checkQueueToFilling() {
    if (this.#queue.length) {
      for (let i = 0; i < this.#queue.length; i++) {
        for (let j = 0; j < this.#filling.length; j++) {
          if (!this.#filling[j].car &&
            this.#queue[i].typeFuel === this.#filling[j].type) {
            this.#filling[j].car = this.#queue.splice(i, 1)[0];
            this.fillingGo(this.#filling[j]);
            this.renderStation.renderStation();
            break;
          }
        }
      }
    }
  }

  fillingGo(column) {
    const car = column.car;
    const needPetrol = car.needPetrol;
    let nowTank = car.nowTank;
    const timerId = setInterval(() => {
      nowTank += column.speed;
      if (nowTank >= car.maxTank) {
        clearInterval(timerId);
        const total = car.nowTank - needPetrol;
        car.fillUp();
        column.car = null;
        this.leaveClient({car, total});
      }
    }, 1000);
  }

  leaveClient({car, total}) {
    this.#ready.push(car);
    this.renderStation.renderStation();
  }

  addCarQueue(car) {
    this.#queue.push(car);
    this.renderStation.renderStation();
  }
}
