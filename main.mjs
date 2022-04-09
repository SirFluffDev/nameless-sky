// Establish global values
import { config } from "./Classes/config.mjs";

config.set("scale", Math.min(
  Math.floor(window.innerWidth / 240),
  Math.floor(window.innerHeight / 144)
));

config.set("tileSize", 16);

const SCALE = config.get("scale");
const TILE_SIZE = config.get("tileSize");

// Dyanmically import the other needed modules
const Input = await import("./Classes/input.mjs");
const Utility = await import("./Classes/utility.mjs");

const World = (await import("./Classes/world.mjs")).default;
const Player = (await import("./Classes/player.mjs")).default;

const { Tile, Tileset } = await import("./Classes/tile.mjs");

// Adjust the game scale to best fit the current screen
const container = document.getElementById("container");

console.log(config);

container.style.width = `${240 * SCALE}px`;
container.style.height = `${144 * SCALE}px`;

console.debug("Canvas scale:", SCALE)
// Load all canvases into a layer object
let layers = {};
let layersObj = container.children;
for (let i = 0; i < layersObj.length; i++) {
  let c = layersObj[i];

  console.log(c.nodeName)
  if (c.nodeName !== "CANVAS") { continue; }

  c.width = 256;
  c.height = 160;
  c.style.width = c.width * SCALE + 'px';
  c.style.height = c.height * SCALE + 'px';

  layers[c.getAttribute('layername')] = c.getContext('2d', {
    alpha: ((c.getAttribute('alpha') || null) == 'true')
  });
}

// Load all needed tilesets
let tilesets = {
  sand: new Tileset(await Utility.loadImageAsync("./Assets/sand.png"), TILE_SIZE),
  grass: new Tileset(await Utility.loadImageAsync("./Assets/grass.png"), TILE_SIZE),
  water: new Tileset(await Utility.loadImageAsync("./Assets/water.png"), TILE_SIZE),
  stone: new Tileset(await Utility.loadImageAsync("./Assets/stone.png"), TILE_SIZE)
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
  await Utility.loadImageAsync("./Assets/player.png"),
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

  Input.update();
}

window.requestAnimationFrame(loop);