import { getRandomItemFrom, isCollision } from './Additional.js';
import Cinematic from './Cinematic.js';
import DisplayObject from './DisplayObject.js';
import Game from './Game.js';
import Group from './Group.js';
import { loadImage, loadJSON } from './Loader.js';
import Sprite from './Sprite.js';
import TextUI from './TextUI.js';

const scale = 2;

export default async function main() {
  const game = new Game({
    width: window.screen.availWidth,
    height: window.screen.availHeight,
    backgroundColor: 'black',
  });

  const party = new Group();
  party.offsetX = window.innerWidth / 2 - 225;
  game.store.add(party);

  const status = new TextUI({
    content: 'points: 0',
    fill: 'white',
    x: window.innerWidth / 2 - 325,
    y: 50,
  });
  status.points = 0;
  game.store.add(status);

  document.body.append(game.canvas);
  document.body.style.backgroundColor = 'black';

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
  });

  const rightPortal = new DisplayObject({
    x: atlas.position.rightPortal.x * scale,
    y: atlas.position.rightPortal.y * scale,
    width: atlas.position.rightPortal.width * scale,
    height: atlas.position.rightPortal.height * scale,
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

    speedX: 2,
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

  foods.forEach((food) => party.add(food));
  ghosts.forEach((ghost) => party.add(ghost));
  walls.forEach((wall) => party.add(wall));
  tablets.forEach((tablet) => party.add(tablet));
  party.add(maze);
  party.add(rightPortal);
  party.add(leftPortal);
  party.add(pacman);

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
        spriteObj.speedY = -2;
      }
      spriteObj.y += 10;
    } else if (spriteObj.nextDirection === 'down') {
      spriteObj.y += 10;
      if (!getWallCollision(spriteObj)) {
        spriteObj.nextDirection = null;
        spriteObj.startAnimation('down');
        spriteObj.speedX = 0;
        spriteObj.speedY = 2;
      }
      spriteObj.y -= 10;
    } else if (spriteObj.nextDirection === 'left') {
      spriteObj.x -= 10;
      if (!getWallCollision(spriteObj)) {
        spriteObj.nextDirection = null;
        spriteObj.startAnimation('left');
        spriteObj.speedX = -2;
        spriteObj.speedY = 0;
      }
      spriteObj.x += 10;
    } else if (spriteObj.nextDirection === 'right') {
      spriteObj.x += 10;
      if (!getWallCollision(spriteObj)) {
        spriteObj.nextDirection = null;
        spriteObj.startAnimation('right');
        spriteObj.speedX = 2;
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
        party.remove(food);
        status.points += 1;
        status.content = `points: ${status.points}`;
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

      if ((ghost.speedX === 0 && ghost.speedY === 0) || Math.random() > 0.95) {
        if (ghost.currentAnimation.name.match('up')) {
          ghost.nextDirection = getRandomItemFrom(['left', 'right']);
        } else if (ghost.currentAnimation.name.match('down')) {
          ghost.nextDirection = getRandomItemFrom(['left', 'right']);
        } else if (ghost.currentAnimation.name.match('left')) {
          ghost.nextDirection = getRandomItemFrom(['down', 'up']);
        } else if (ghost.currentAnimation.name.match('right')) {
          ghost.nextDirection = getRandomItemFrom(['down', 'up']);
        }
      }
      // check collision ghost with pacman
      if (pacman.play && ghost.play && isCollision(ghost, pacman)) {
        if (ghost.isBlue) {
          ghost.play = false;
          ghost.speedX = 0;
          ghost.speedY = 0;
          status.points += 10;
          status.content = `points: ${status.points}`;
          party.remove(ghost);
          ghosts.splice(ghosts.indexOf(ghost), 1);
        } else {
          pacman.speedX = 0;
          pacman.speedY = 0;
          pacman.startAnimation('die', {
            onEnd() {
              pacman.play = false;
              setTimeout(() => {
                pacman.stopAnimation();
                party.remove(pacman);
              }, 1500);
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
    // portals
    if (isCollision(pacman, leftPortal)) {
      pacman.x = (rightPortal.x - pacman.width);
    }
    if (isCollision(pacman, rightPortal)) {
      pacman.x = (leftPortal.x + pacman.width);
    }
    ghosts.forEach((g) => {
      const ghost = g;
      if (isCollision(ghost, leftPortal)) {
        ghost.x = (rightPortal.x - ghost.width);
      }
      if (isCollision(ghost, rightPortal)) {
        ghost.x = (leftPortal.x + ghost.width);
      }
    });
    // collision tablets
    for (let i = 0; i < tablets.length; i += 1) {
      const tablet = tablets[i];
      if (isCollision(pacman, tablet)) {
        tablets.splice(i, 1);
        party.remove(tablet);
        ghosts.forEach((g) => {
          const ghost = g;
          ghost.originalAnimations = ghost.collectionAnimations;
          ghost.collectionAnimations = atlas.blueGhost;
          ghost.startAnimation(ghost.currentAnimation.name);
          ghost.isBlue = true;
        });

        setTimeout(() => {
          ghosts.forEach((g) => {
            const ghost = g;
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
