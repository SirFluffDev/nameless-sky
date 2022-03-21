import * as Input from "./Classes/input.mjs";

import { loadImageAsync } from "./Classes/utility.mjs";

import { Tile, Tileset } from "./Classes/tile.mjs";
import World from "./Classes/world.mjs";
import Player from "./Classes/player.mjs";

/*var canvas = document.getElementById("canvas");
canvas.width = 240 + 16;
canvas.height = 144 + 16;
var ctx = canvas.getContext("2d", { alpha: false });
canvas.style.width = canvas.width * 4 + 'px';
canvas.style.height = canvas.height * 4 + 'px';*/

var layers = {};
let layersObj = document.getElementsByTagName("canvas");
for (let i = 0; i < layersObj.length; i++) {
  let c = layersObj[i];

  c.width = 240 + 16;
  c.height = 144 + 16;
  c.style.width = c.width * 4 + 'px';
  c.style.height = c.height * 4 + 'px';

  let a = ((c.getAttribute('alpha') || null) == 'true');

  layers[c.getAttribute('layername')] = c.getContext('2d', { alpha: a });
}

console.log(layers.world)
layers.world.fillStyle = "#ffffff";

// Image loading function //
var tilesets = {
  sand: new Tileset(await loadImageAsync("./Assets/sand.png"), 16),
  grass: new Tileset(await loadImageAsync("./Assets/grass.png"), 16),
  water: new Tileset(await loadImageAsync("./Assets/water.png"), 16)
}

Tile.create('grass', 6, 'sand', tilesets.grass)
Tile.create('sand', 3, 'water', tilesets.sand)
Tile.create('water', 0, 'grass', tilesets.water)

var world = new World('worldname', 64, 64);

await world.generate({
  scale: 0.02,
  pondScale: 0.1,

  ocean: 0.5,
  sand: 0.55,
  grass: 0.7,
});

var player = new Player(
  await loadImageAsync("./Assets/player.png")
);

// Display the generated snippet of world
function draw() {
  for (let dy = 0; dy < 8 + 2; dy++) {
    for (let dx = 0; dx < 16 + 1; dx++) {
      let x = dx + ~~Math.max(player.x / 16 - 7, 0);
      let y = dy + ~~Math.max(player.y / 16 - 4, 0);

      //var tile = world.get(x, y);
      world.draw(layers.world, x, y, dx * 16, dy * 16);
    }
  }
}

draw()

console.log("Rendering finished!")

var prevX = 0, prevY = 0;

function loop(timestamp) {
  window.requestAnimationFrame(loop);

  player.update(layers.world.canvas, world, timestamp);

  // Re-draw the world if the player moves a tile
  if (
    prevX !== Math.floor(Math.max(player.x / 16, 0)) ||
    prevY !== Math.floor(Math.max(player.y / 16, 0))
  ) { draw(); console.log("Updated!") }

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

  // Clear input buffers
  Input.reset();
}

window.requestAnimationFrame(loop);