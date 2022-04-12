// Import all needed modules
import * as Input from "./Classes/input.mjs";
import * as Utility from "./Classes/utility.mjs";

import World from "./Classes/world.mjs";
import Player from "./Classes/player.mjs";

import { Tile, Tileset } from "./Classes/tile.mjs";

// Save global values for convenience
const
  TILE_SIZE = window['game'].TILE_SIZE,
  SCALE = window['game'].SCALE;

// Scale the canvas to best fit the screen
const container = document.getElementById("container");

container.style.width = `${240 * SCALE}px`;
container.style.height = `${144 * SCALE}px`;

// Load all canvases into a layer object
let layer = {};
let layersObj = container.children;
for (let i = 0; i < layersObj.length; i++) {
  let c = layersObj[i];

  if (c.nodeName !== "CANVAS") { continue; }

  c.width = 256;
  c.height = 160;
  c.style.width = c.width * SCALE + 'px';
  c.style.height = c.height * SCALE + 'px';

  layer[c.getAttribute('layername')] = c.getContext('2d', {
    alpha: ((c.getAttribute('alpha') || null) == 'true')
  });
}

// Load UI images
const UI_Sheet = await Utility.loadImageAsync("./Assets/ui.png");

// Load all tile types
const tileData = await (await fetch("./Data/tiles.json")).json();
for (let i = 0; i < tileData.length; i++) {
  Tile.create(tileData[i]);
}

// World creation
let world = new World(
  'worldname', 64, 64,
  new Tileset(await Utility.loadImageAsync("./Assets/tileset.png"), TILE_SIZE)
);

await world.generate({
  scale: 0.02,
  pondScale: 0.1,

  ocean: 0.5,
  sand: 0.55,
  grass: 0.6,
});

let player = new Player(
  await Utility.loadImageAsync("./Assets/player.png"),
  32 * 16, 32 * 16
);

// Draw the world
function draw() {
  layer.top.clearRect(0, 0, layer.world.canvas.width, layer.world.canvas.height);

  for (let dy = 0; dy < 8 + 2; dy++) {
    for (let dx = 0; dx < 16 + 1; dx++) {
      let x = dx + ~~Math.max(player.x / 16 - 7, 0);
      let y = dy + ~~Math.max(player.y / 16 - 4, 0);

      world.draw(layer.world, layer.top, x, y, dx * 16, dy * 16);
    }
  }
}

for (let i = 0; i < 10; i++) {
  layer.UI.drawImage(UI_Sheet, 0, 0, 8, 8, 2 + i * 8, 2, 8, 8);
  layer.UI.drawImage(UI_Sheet, 0, 8, 8, 8, layer.UI.canvas.width - 107 + i * 9, 2, 8, 8);

  layer.UI.drawImage(UI_Sheet, (i === 2 ? 16 : 0), 16, 16, 16, 2 + i * 17, layer.UI.canvas.height - 18 - 16, 16, 16);
}

draw();
Input.init(container);

let prevX, prevY;
function loop(timestamp) {
  window.requestAnimationFrame(loop);

  // Run all player related code
  player.update(
    layer.world.canvas, layer.top.canvas,
    world, timestamp
  );

  // Re-draw the world if the player moves a tile
  if (
    prevX !== Math.floor(Math.max(player.x / 16, 0)) ||
    prevY !== Math.floor(Math.max(player.y / 16, 0))
  ) {
    draw();
    console.debug("Updated!")
  }

  // Clear the entity canvas
  layer.entities.clearRect(0, 0, layer.entities.canvas.width, layer.entities.canvas.height);

  // Draw the player in the correct position
  let px, py;
  if (player.x < 7 * 16) px = ~~player.x; else px = 7 * 16;
  if (player.y < 4 * 16) py = ~~player.y; else py = 4 * 16;

  // Cache the previous tile's position
  prevX = ~~Math.max(player.x / 16, 0);
  prevY = ~~Math.max(player.y / 16, 0);

  //Draw the player onscreen
  player.draw(layer.entities, px, py, world);

  Input.update();
}

window.requestAnimationFrame(loop);