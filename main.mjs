import * as Input from "Classes/input.mjs";

import { loadImageAsync } from "Classes/utility.mjs";

import { Tile, Tileset } from "Classes/tile.mjs";
import World from "Classes/world.mjs";

var canvas = document.getElementById("canvas");
canvas.width = 256;
canvas.height = 128;
var ctx = canvas.getContext("2d", { alpha: false });
ctx.fillStyle = "#ffffff";

// Image loading function //
var tilesets = {
  sand: new Tileset(await loadImageAsync("./Assets/sand.png"), 16),
  grass: new Tileset(await loadImageAsync("./Assets/grass.png"), 16),
  water: new Tileset(await loadImageAsync("./Assets/water.png"), 16)
}

Tile.create('grass', 6, 'sand', tilesets.grass)
Tile.create('sand', 3, 'water', tilesets.sand)
Tile.create('water', 0, 'grass', tilesets.water)

var world = new World('worldname', 512, 512);

await world.generate({
  scale: 0.02,
  pondScale: 0.1,

  ocean: 0.5,
  sand: 0.55,
  grass: 0.7,
});

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

var player = new Player(5, 5);

// Display the generated snippet of world
function draw() {
  for (let dy = 0; dy < 8; dy++) {
    for (let dx = 0; dx < 16; dx++) {
      let x = dx + player.x;
      let y = dy + player.y;

      //var tile = world.get(x, y);
      world.draw(ctx, x, y, dx * 16, dy * 16);
    }
  }
}

draw()

console.log("Rendering finished!")

function loop(timestamp) {
  window.requestAnimationFrame(loop);

  if (Input.pressed.includes("ArrowRight")) {
    player.x++;
    draw()
  }

  if (Input.pressed.includes("ArrowDown")) {
    player.y++;
    draw()
  }

  if (Input.pressed.includes("ArrowUp")) {
    player.y--;
    draw()
  }

  if (Input.pressed.includes("ArrowLeft")) {
    player.x--;
    draw()
  }

  Input.reset()
}

window.requestAnimationFrame(loop);