import Cinematic from "./Cinematic.js";
import Game from "./Game.js";
import Loader from "./Loader.js";
import Sprite from "./Sprite.js";

const scale = 2;

export default async function main() {
  const game = new Game({
    backgroundColor: 'black',
  });

  document.body.append(game.canvas);
  document.body.style.backgroundColor = 'gray';

  const image = await Loader.loadImage('../sets/spritesheet.png');
  const atlas = await Loader.loadJSON('../sets/atlas.json');

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

  const foods = atlas.maze.foods.map(food => {
    return new Sprite({
      image,

      x: food.x * scale,
      y: food.y * scale,
      width: food.width * scale,
      height: food.height * scale,

      frame: atlas.food
    });
  });

  const pacman = new Cinematic({
    image,
    x: atlas.position.pacman.x * scale,
    y: atlas.position.pacman.y * scale,
    width: 13 * scale,
    height: 13 * scale,

    animations: atlas.pacman,
    debug: true,
  })

  pacman.startAnimation('right');

  const ghosts = ['red', 'pink', 'turquoise', 'banana']
    .map(color => {
      const ghost = new Cinematic({
        image,
        x: atlas.position[color].x * scale,
        y: atlas.position[color].y * scale,
        width: 13 * scale,
        height: 13 * scale,

        frame: atlas.position[color],

        animations: atlas[`${color}Ghost`]
      });
      ghost.startAnimation(atlas.position[color].direction);
      return ghost;
    })

  foods.forEach(food => game.store.add(food));
  ghosts.forEach(ghost => game.store.add(ghost));
  game.store.add(maze);
  game.store.add(pacman);
}