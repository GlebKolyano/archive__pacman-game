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

  game.store.add(maze);
}