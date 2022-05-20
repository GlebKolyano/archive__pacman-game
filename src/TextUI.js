import DisplayObject from './DisplayObject.js';

export default class TextUI extends DisplayObject {
  constructor(props = {}) {
    super(props);

    this.content = props.content ?? '';
    this.font = props.font ?? '20px serif';
    this.fill = props.fill ?? 'white';
  }

  draw(context) {
    context.font = this.font;
    context.fillStyle = this.fill;
    context.textAlign = 'center';
    context.fillText(this.content, this.x, this.y);
  }
}
