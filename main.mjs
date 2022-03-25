import * as Input from "./Classes/input.mjs";

import { loadImageAsync } from "./Classes/utility.mjs";

import { Tile, Tileset } from "./Classes/tile.mjs";
import World from "./Classes/world.mjs";
import Player from "./Classes/player.mjs";

// Load canvases
var layers = {};
let layersObj = document.getElementsByTagName("canvas");
for (let i = 0; i < layersObj.length; i++) {
  let c = layersObj[i];

  c.width = 240 + 16;
  c.height = 144 + 16;
  c.style.width = c.width * 4 + 'px';
  c.style.height = c.height * 4 + 'px';

  layers[c.getAttribute('layername')] = c.getContext('2d', {
    alpha: ((c.getAttribute('alpha') || null) == 'true')
  });
}

// Load all needed tilesets
var tilesets = {
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

var world = new World('worldname', 64, 64);

await world.generate({
  scale: 0.02,
  pondScale: 0.1,

  ocean: 0.5,
  sand: 0.55,
  grass: 0.7,
});

var player = new Player(
  await loadImageAsync("./Assets/player.png"),
  0, 0
);

// Display the generated snippet of world
function draw() {
  layers.world.clearRect(0, 0, layers.world.canvas.width, layers.world.canvas.height);

  for (let dy = 0; dy < 8 + 2; dy++) {
    for (let dx = 0; dx < 16 + 1; dx++) {
      let x = dx + Math.floor(player.x / 16) - 7;
      let y = dy + Math.floor(player.y / 16) - 4;

      //var tile = world.get(x, y);
      world.draw(layers.world, x, y, dx * 16, dy * 16);
    }
  }
}

draw()

var prevX, prevY;

function loop(timestamp) {
  window.requestAnimationFrame(loop);

  // Clear the entity canvas
  layers.player.clearRect(0, 0, layers.player.canvas.width, layers.player.canvas.height)
  player.update(layers.world.canvas, world, timestamp, layers.player);

  // Re-draw the world if the player moves a tile
  if (
    prevX !== ~~(player.x / 16, 0) ||
    prevY !== ~~(player.y / 16, 0)
  ) {
    draw();
    console.debug("Updated!")
  }


  // Draw the player in the correct position
  let px, py;
  px = 7 * 16;
  py = 4 * 16;

  // Cache the previous tile's position
  prevX = ~~(player.x / 16);
  prevY = ~~(player.y / 16);

  //Draw the player onscreen
  player.draw(layers.player, px, py);

  // Clear input buffers
  Input.reset();
}

window.requestAnimationFrame(loop);