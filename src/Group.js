export default class Group {
  constructor(props = {}) {
    this.container = new Set;
  }

  get items() {
    return Array.from(this.container);
  }

  add(...objects) {
    for (const object of objects) {
      this.container.add(object);
    }
  }

  remove(...objects) {
    for (const object of objects) {
      this.container.delete(object);
    }
  }

  draw(context) {
    this.container.forEach(obj => obj.draw());
  }

  update() {}

}