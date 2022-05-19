export default class DisplayObject {
  constructor(props = {}) {
    this.x = props.x ?? 0;
    this.y = props.y ?? 0;
    this.width = props.width ?? 0;
    this.height = props.height ?? 0;

    this.debug = props.debug ?? false;
  }

  update() {}

  draw(context) {
    if (this.debug) {
      context.beginPath();
      context.rect(this.x, this.y, this.width, this.height);
      context.fillStyle = 'rgb(0, 255, 0, 0.3)';
      context.fill();

      context.beginPath();
      context.rect(this.x, this.y, this.width, this.height);
      context.strokeStyle = 'rgb(0, 255, 0, 0.3)';
      context.stroke();
    }
  }
}
