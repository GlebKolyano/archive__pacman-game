import Group from "./Group.js";

export default class Game {
  constructor(props = {}) {
    
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');

    this.store = new Group;

    this.canvas.width = props.width ?? 0;
    this.canvas.height = props.height ?? 0;
    this.canvas.backgroundColor = props.backgroundColor ?? 'black';

    requestAnimationFrame(timestamp => this.render(timestamp));
  }

  clear() {
    this.canvas.width = this.canvas.width;
  }
  draw() {
    this.context.beginPath();
    this.context.rect(0, 0, this.canvas.width, this.canvas.height);
    this.context.fillStyle = this.canvas.backgroundColor;
    this.context.fill();
  }

  render(timestamp) {
    requestAnimationFrame(timestamp => this.render(timestamp));

    this.clear();
    this.draw();

    this.store.draw(this.context);
  }
}