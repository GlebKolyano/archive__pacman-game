import { isCollision } from './Additional.js';
import Cinematic from './Cinematic.js';
import DisplayObject from './DisplayObject.js';
import Game from './Game.js';
import { loadImage, loadJSON } from './Loader.js';
import Sprite from './Sprite.js';

const scale = 2;

export default async function main() {
  const game = new Game({
    backgroundColor: 'black',
  });

  document.body.append(game.canvas);
  document.body.style.backgroundColor = 'gray';

  const image = await loadImage('../sets/spritesheet.png');
  const atlas = await loadJSON('../sets/atlas.json');

  const maze = new Sprite({
    image,

    x: 0,
    y: 0,
    width: atlas.maze.width * scale,
    height: atlas.maze.height * scale,

    frame: atlas.maze,
  });
  game.canvas.width = maze.width;
  game.canvas.height = maze.height;

  const walls = atlas.maze.walls.map((wall) => new DisplayObject({
    x: wall.x * scale,
    y: wall.y * scale,
    width: wall.width * scale,
    height: wall.height * scale,
  }));

  const foods = atlas.maze.foods.map((food) => new Sprite({
    image,

    x: food.x * scale,
    y: food.y * scale,
    width: food.width * scale,
    height: food.height * scale,

    frame: atlas.food,
  }));

  const pacman = new Cinematic({
    image,
    x: atlas.position.pacman.x * scale,
    y: atlas.position.pacman.y * scale,
    width: 13 * scale,
    height: 13 * scale,

    animations: atlas.pacman,
    debug: true,
    speedX: 1,
  });
  pacman.direction = 'right';
  pacman.startAnimation('right');

  const ghosts = ['red', 'pink', 'turquoise', 'banana']
    .map((color) => {
      const ghost = new Cinematic({
        image,
        x: atlas.position[color].x * scale,
        y: atlas.position[color].y * scale,
        width: 13 * scale,
        height: 13 * scale,

        frame: atlas.position[color],

        animations: atlas[`${color}Ghost`],
      });
      ghost.startAnimation(atlas.position[color].direction);
      return ghost;
    });

  foods.forEach((food) => game.store.add(food));
  ghosts.forEach((ghost) => game.store.add(ghost));
  walls.forEach((wall) => game.store.add(wall));
  game.store.add(maze);
  game.store.add(pacman);

  document.addEventListener('keydown', (e) => {
    if (e.code.match('ArrowUp')) {
      pacman.nextDirection = 'up';
    } else if (e.code.match('ArrowDown')) {
      pacman.nextDirection = 'down';
    } else if (e.code.match('ArrowLeft')) {
      pacman.nextDirection = 'left';
    } else if (e.code.match('ArrowRight')) {
      pacman.nextDirection = 'right';
    }
  });

  function getWallCollision(obj) {
    for (const wall of walls) {
      if (isCollision(wall, obj)) {
        return wall;
      }
    }
    return null;
  }

  function defineDirectionObject(obj) {
    const spriteObj = obj;
    if (!spriteObj.nextDirection) {
      return;
    }
    if (spriteObj.nextDirection === 'up') {
      spriteObj.y -= 10;
      if (!getWallCollision(spriteObj)) {
        spriteObj.nextDirection = null;
        spriteObj.startAnimation('up');
        spriteObj.speedX = 0;
        spriteObj.speedY = -1;
      }
      spriteObj.y += 10;
    } else if (spriteObj.nextDirection === 'down') {
      spriteObj.y += 10;
      if (!getWallCollision(spriteObj)) {
        spriteObj.nextDirection = null;
        spriteObj.startAnimation('down');
        spriteObj.speedX = 0;
        spriteObj.speedY = 1;
      }
      spriteObj.y -= 10;
    } else if (spriteObj.nextDirection === 'left') {
      spriteObj.x -= 10;
      if (!getWallCollision(spriteObj)) {
        spriteObj.nextDirection = null;
        spriteObj.startAnimation('left');
        spriteObj.speedX = -1;
        spriteObj.speedY = 0;
      }
      spriteObj.x += 10;
    } else if (spriteObj.nextDirection === 'right') {
      spriteObj.x += 10;
      if (!getWallCollision(spriteObj)) {
        spriteObj.nextDirection = null;
        spriteObj.startAnimation('right');
        spriteObj.speedX = 1;
        spriteObj.speedY = 0;
      }
      spriteObj.x -= 10;
    }
  }

  game.update = () => {
    // check collision pacman with wall
    const wall = getWallCollision(pacman.getNextPosition());
    if (wall) {
      pacman.startAnimation(`wait${pacman.currentAnimation.name}`);
      pacman.speedX = 0;
      pacman.speedY = 0;
    }
    defineDirectionObject(pacman);
  };
}
