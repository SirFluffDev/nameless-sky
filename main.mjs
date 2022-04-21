// Set everything up
import "./init.mjs";

// Import all needed modules
import * as Input from "./Classes/input.mjs";
import * as Utility from "./Classes/utility.mjs";
import * as UI from "./Classes/ui.mjs";

import World from "./Classes/world.mjs";
import Player from "./Classes/player.mjs";

import { Tile, Tileset } from "./Classes/tile.mjs";

// Save global values for convenience
const
  LAYERS = window.game.LAYERS,
  TILE_SIZE = window.game.TILE_SIZE;

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
  grass: 0.7,
});

const player = new Player(
  await Utility.loadImageAsync("./Assets/player.png"),
  32 * 16, 32 * 16
);

window.game.give = (item, count) => { player.inventory.give(item, count) };

UI.updateInventory(player.inventory);
UI.update(player);

// Draw the world
function draw() {
  LAYERS.top.clear();

  for (let dy = 0; dy < 8 + 2; dy++) {
    for (let dx = 0; dx < 16 + 1; dx++) {
      let x = dx + ~~Math.max(player.x / 16 - 7, 0);
      let y = dy + ~~Math.max(player.y / 16 - 4, 0);

      world.draw(x, y, dx * 16, dy * 16);
    }
  }

  console.debug("Updated!");
}

draw();
Input.init(container);

let prevX, prevY;
function loop(timestamp) {
  try {
    window.requestAnimationFrame(loop);

    // Run all player related code
    player.update(world, timestamp);

    // Re-draw the world if the player moves a tile
    if (
      prevX !== Math.floor(Math.max(player.x / 16, 0)) ||
      prevY !== Math.floor(Math.max(player.y / 16, 0))
    ) { draw() }

    // Clear the entity canvas
    LAYERS.entities.clear();

    // Draw the player in the correct position
    let px, py;
    if (player.x < 7 * 16) px = ~~player.x; else px = 7 * 16;
    if (player.y < 4 * 16) py = ~~player.y; else py = 4 * 16;

    // Cache the previous tile's position
    prevX = ~~Math.max(player.x / 16, 0);
    prevY = ~~Math.max(player.y / 16, 0);

    //Draw the player onscreen
    player.draw(LAYERS.entities, px, py, world);

    Input.update();
  }

  // Error handling in the loop
  catch (err) {
    console.error(err);

    for (const key in LAYERS) {
      LAYERS[key].clear();
    }

    window.game.LAYERS.world.clear()
    window.game.LAYERS.UI.fillText("An error occured!", 0, 4);
    window.game.LAYERS.UI.fillText("Check the browser console for more info", 0, 9);
  }
}

window.requestAnimationFrame(loop);