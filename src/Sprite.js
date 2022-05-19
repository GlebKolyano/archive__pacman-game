import DisplayObject from './DisplayObject.js';

export default class Sprite extends DisplayObject {
  constructor(props = {}) {
    super(props);

    this.image = props.image ?? null;
    this.frame = props.frame ?? null;

    this.nextDirection = null;
    this.speedX = props.speedX ?? 0;
    this.speedY = props.speedY ?? 0;
  }

  getNextPosition() {
    return {
      x: this.x + this.speedX,
      y: this.y + this.speedY,
      width: this.width,
      height: this.height,
    };
  }

  draw(context) {
    context.drawImage(
      this.image,

      this.frame.x,
      this.frame.y,
      this.frame.width,
      this.frame.height,

      this.x,
      this.y,
      this.width,
      this.height,
    );
  }

  update(delta) {
    this.x += this.speedX;
    this.y += this.speedY;
  }
}
