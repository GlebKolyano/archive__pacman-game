import Sprite from './Sprite.js';

export default class Cinematic extends Sprite {
  constructor(props = {}) {
    super(props);

    this.collectionAnimations = props.animations ?? {};
    this.currentAnimation = props.animation ?? null;
    this.cooldown = 0;
    this.timer = 0;
    this.frameNumber = 0;
  }

  startAnimation(animationName, param = {}) {
    const animation = this.collectionAnimations.find((anim) => anim.name === animationName);

    if (animation && this.currentAnimation !== animation) {
      this.currentAnimation = animation;
      this.cooldown = this.currentAnimation.duration / this.currentAnimation.frames.length;
      this.timer = 0;
      this.frameNumber = 0;
      [this.frame] = this.currentAnimation.frames;
    }
    if (param.onEnd) {
      this.onEnd = param.onEnd;
    }
  }

  stopAnimation() {
    this.currentAnimation = null;
    this.cooldown = 0;
    this.timer = 0;
    this.frameNumber = 0;
    this.frame = null;
  }

  update(delta) {
    super.update(delta);
    this.timer += delta;
    if (this.currentAnimation) {
      if (this.timer >= this.cooldown) {
        this.frameNumber = (this.frameNumber + 1) % this.currentAnimation.frames.length;
        this.frame = this.currentAnimation.frames[this.frameNumber];
        this.timer = 0;
      }
    }

    if (this.frameNumber === 0 && this.onEnd) {
      this.onEnd();
    }
  }
}
