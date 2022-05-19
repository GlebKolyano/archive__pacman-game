export default class Group {
  constructor() {
    this.container = new Set();
  }

  get items() {
    return Array.from(this.container);
  }

  add(...objects) {
    objects.forEach((obj) => this.container.add(obj));
  }

  remove(...objects) {
    objects.forEach((obj) => this.container.delete(obj));
  }

  draw(context) {
    this.items.forEach((obj) => obj.draw(context));
  }

  update(delta) {
    this.items.forEach((obj) => obj.update(delta));
  }
}
