export default class Group {
  constructor() {
    this.container = new Set();

    this.offsetX = 0;
    this.offsetY = 10;
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
    context.save();
    context.translate(this.offsetX, this.offsetY);
    this.items.forEach((obj) => obj.draw(context));
    context.restore();
  }

  update(delta) {
    this.items.forEach((obj) => obj.update(delta));
  }
}
