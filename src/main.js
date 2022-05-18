import Game from "./Game.js";

export default async function main() {
  const game = new Game({
    width: 100,
    height: 100,
    backgroundColor: 'black',
  });

  document.body.append(game.canvas);
  document.body.style.backgroundColor = 'gray';
}