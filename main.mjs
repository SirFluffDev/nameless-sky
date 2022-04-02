import * as Input from "./Classes/input.mjs";

import { loadImageAsync } from "./Classes/utility.mjs";

import { Tile, Tileset } from "./Classes/tile.mjs";
import World from "./Classes/world.mjs";
import Player from "./Classes/player.mjs";

const container = document.getElementById("container");

const scale = Math.min(
  Math.floor(window.innerWidth / 240),
  Math.floor(window.innerHeight / 144)
);

container.style.width = `${240 * scale}px`;
container.style.height = `${144 * scale}px`;

console.debug("Canvas scale:", scale)
// Load canvases
let layers = {};
let layersObj = container.children;
for (let i = 0; i < layersObj.length; i++) {
  let c = layersObj[i];

  console.log(c.nodeName)
  if (c.nodeName !== "CANVAS") { continue; }

  c.width = 256;
  c.height = 160;
  c.style.width = c.width * scale + 'px';
  c.style.height = c.height * scale + 'px';

  layers[c.getAttribute('layername')] = c.getContext('2d', {
    alpha: ((c.getAttribute('alpha') || null) == 'true')
  });
}

// Load all needed tilesets
let tilesets = {
  sand: new Tileset(await loadImageAsync("./Assets/sand.png"), 16),
  grass: new Tileset(await loadImageAsync("./Assets/grass.png"), 16),
  water: new Tileset(await loadImageAsync("./Assets/water.png"), 16),
  stone: new Tileset(await loadImageAsync("./Assets/stone.png"), 16)
}

Tile.create({
  name: 'water',
  merge: 'grass',
  tileset: tilesets.water,

  solid: false
});

Tile.create({
  name: 'grass',
  merge: 'sand',
  tileset: tilesets.grass,

  solid: false
});

Tile.create({
  name: 'sand',
  merge: 'water',
  tileset: tilesets.sand,

  solid: false
});

Tile.create({
  name: 'stone',
  merge: 'grass',
  tileset: tilesets.stone,

  solid: true
});

let world = new World('worldname', 64, 64);

await world.generate({
  scale: 0.02,
  pondScale: 0.1,

  ocean: 0.5,
  sand: 0.55,
  grass: 0.6,
});

let player = new Player(
  await loadImageAsync("./Assets/player.png"),
  32 * 16, 32 * 16
);

// Display the generated snippet of world
function draw() {
  layers.world.clearRect(0, 0, layers.world.canvas.width, layers.world.canvas.height);

  for (let dy = 0; dy < 8 + 2; dy++) {
    for (let dx = 0; dx < 16 + 1; dx++) {
      let x = dx + ~~Math.max(player.x / 16 - 7, 0);
      let y = dy + ~~Math.max(player.y / 16 - 4, 0);

      world.draw(layers.world, x, y, dx * 16, dy * 16);
    }
  }
}

draw();
Input.init(container);

let prevX, prevY;
function loop(timestamp) {
  window.requestAnimationFrame(loop);
  Input.update();

  player.update(layers.world.canvas, world, timestamp);

  // Re-draw the world if the player moves a tile
  if (
    prevX !== Math.floor(Math.max(player.x / 16, 0)) ||
    prevY !== Math.floor(Math.max(player.y / 16, 0))
  ) {
    draw();
    console.debug("Updated!")
  }

  // Clear the entity canvas
  layers.player.clearRect(0, 0, layers.player.canvas.width, layers.player.canvas.height)

  // Draw the player in the correct position
  let px, py;
  if (player.x < 7 * 16) px = ~~player.x; else px = 7 * 16;
  if (player.y < 4 * 16) py = ~~player.y; else py = 4 * 16;

  // Cache the previous tile's position
  prevX = ~~Math.max(player.x / 16, 0);
  prevY = ~~Math.max(player.y / 16, 0);

  //Draw the player onscreen
  player.draw(layers.player, px, py);

  Input.reset();
}

window.requestAnimationFrame(loop);