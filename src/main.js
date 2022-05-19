import { getRandomItemFrom, isCollision } from './Additional.js';
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
  const leftPortal = new DisplayObject({
    x: atlas.position.leftPortal.x * scale,
    y: atlas.position.leftPortal.y * scale,
    width: atlas.position.leftPortal.width * scale,
    height: atlas.position.leftPortal.height * scale,
    debug: true,
  });

  const rightPortal = new DisplayObject({
    x: atlas.position.rightPortal.x * scale,
    y: atlas.position.rightPortal.y * scale,
    width: atlas.position.rightPortal.width * scale,
    height: atlas.position.rightPortal.height * scale,
    debug: true,
  });

  let foods = atlas.maze.foods.map((food) => new Sprite({
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
    width: 15 * scale,
    height: 15 * scale,

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
        width: 14 * scale,
        height: 14 * scale,

        frame: atlas.position[color],

        animations: atlas[`${color}Ghost`],
      });
      ghost.startAnimation(atlas.position[color].direction);
      ghost.nextDirection = atlas.position[color].direction;
      ghost.isBlue = false;

      return ghost;
    });
  const tablets = atlas.position.tablets.map((tablet) => new Sprite({
    image,
    x: tablet.x * scale,
    y: tablet.y * scale,
    width: tablet.width * scale,
    height: tablet.height * scale,

    frame: atlas.tablet,
  }));

  foods.forEach((food) => game.store.add(food));
  ghosts.forEach((ghost) => game.store.add(ghost));
  walls.forEach((wall) => game.store.add(wall));
  tablets.forEach((tablet) => game.store.add(tablet));
  game.store.add(maze);
  game.store.add(rightPortal);
  game.store.add(leftPortal);
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

  function eatFood() {
    const eatedFood = [];

    foods.forEach((food) => {
      if (isCollision(pacman, food)) {
        eatedFood.push(food);
        game.store.remove(food);
      }
    });

    foods = foods.filter((food) => !eatedFood.includes(food));
  }

  game.update = () => {
    eatFood();
    defineDirectionObject(pacman);
    ghosts.forEach((ghost) => defineDirectionObject(ghost));
    // check collision ghost with wall
    ghosts.forEach((g) => {
      const ghost = g;
      if (!ghost.play) return;

      const wall = getWallCollision(ghost.getNextPosition());
      if (wall) {
        ghost.speedX = 0;
        ghost.speedY = 0;
      }

      if (ghost.speedX === 0 && ghost.speedY === 0) {
        if (ghost.currentAnimation.name.match('up')) {
          ghost.nextDirection = getRandomItemFrom(['down', 'left', 'right']);
        } else if (ghost.currentAnimation.name.match('down')) {
          ghost.nextDirection = getRandomItemFrom(['up', 'left', 'right']);
        } else if (ghost.currentAnimation.name.match('left')) {
          ghost.nextDirection = getRandomItemFrom(['down', 'up', 'right']);
        } else if (ghost.currentAnimation.name.match('right')) {
          ghost.nextDirection = getRandomItemFrom(['down', 'left', 'up']);
        }
      }
      // check collision ghost with pacman
      if (pacman.play && ghost.play && isCollision(ghost, pacman)) {
        if (ghost.isBlue) {
          ghost.play = false;
          ghost.speedX = 0;
          ghost.speedY = 0;
          game.store.remove(ghost);
        } else {
          pacman.speedX = 0;
          pacman.speedY = 0;
          pacman.startAnimation('die', {
            onEnd() {
              pacman.play = false;
              pacman.stopAnimation();
              game.store.remove(pacman);
            },
          });
        }
      }
    });

    // check collision pacman with wall
    const wall = getWallCollision(pacman.getNextPosition());
    if (wall) {
      pacman.startAnimation(`wait${pacman.currentAnimation.name}`);
      pacman.speedX = 0;
      pacman.speedY = 0;
    }

    if (isCollision(pacman, leftPortal)) {
      pacman.x = (rightPortal.x - pacman.width);
    }
    if (isCollision(pacman, rightPortal)) {
      pacman.x = (leftPortal.x + pacman.width);
    }
    // collision tablets
    for (let i = 0; i < tablets.length; i += 1) {
      const tablet = tablets[i];
      if (isCollision(pacman, tablet)) {
        tablets.splice(i, 1);
        game.store.remove(tablet);
        ghosts.forEach((ghost) => {
          ghost.originalAnimations = ghost.collectionAnimations;
          ghost.collectionAnimations = atlas.blueGhost;
          ghost.startAnimation(ghost.currentAnimation.name);
          ghost.isBlue = true;
        });

        setTimeout(() => {
          ghosts.forEach((ghost) => {
            ghost.collectionAnimations = ghost.originalAnimations;
            ghost.startAnimation(ghost.currentAnimation.name);
            ghost.isBlue = false;
          });
        }, 5000);
        break;
      }
    }
  };
}
