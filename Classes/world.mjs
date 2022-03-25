// Import perlin noise library for worldgen //
import { Tile } from "./tile.mjs";

let loadingScreen = document.getElementById("loading");
let loadingBar = loadingScreen.children[0].children[0];

/**
 * A simple class used to create and store arrays of tiles
 */
export default class World {
  /** 
   * Create an empty world 
   * @param {string} name - The name of the world
   * @param {Number} width - The world's width in tiles
   * @param {Number} height - The world's height in tiles
  */
  constructor(name, width, height) {
    this.name = name;

    this.width = width;
    this.height = height;

    this.data = [];
  }

  /** 
   * Fill the world array with islands, using perlin noise and web workers
   * @param {Object} settings - An object containing the neccesary world settings
   * 
   * @param {Number} settings.scale - The scale of islands
   * @param {Number} settings.pondScale - The scale of ponds
   * 
   * @param {Number} settings.ocean - The threshold for ocean generation
   * @param {Number} settings.sand  - The threshold for beach generation
   * @param {Number} settings.grass - The threshold for grass generation
   */
  async generate(settings) {
    let self = this;
    loadingScreen.childNodes[0].nodeValue = `Generating world (${this.width} x ${this.height})`;

    return new Promise((resolve, reject) => {
      let start = performance.now()

      // Create and run a worker for worldgen //
      let generationWorker = new Worker(location.href + "Workers/generation.js");
      generationWorker.postMessage([settings, this.width, this.height]);

      // Update the progress bar //
      generationWorker.onmessage = function (e) {
        if (e.data[0] == 'data') {
          loadingScreen.setAttribute('hidden', true);
          console.log(`Finished loading in ${performance.now() - start}ms`)

          self.data = e.data[1];

          resolve();
        } else {
          // Update the loading bar, and, if filled, announce that the world has started loading in
          loadingBar.style.width = `${e.data[1]}%`;
          if (e.data[1] == 100) loadingScreen.innerText = "Loading...";
        }
      }
    })
  }

  /**
   * Fetches a tile from the world using x any y coordinates.
   * If the tile does not exist, an empty ocean tile is returned
   * @param {Number} x 
   * @param {Number} y
   */
  get(x, y) {
    if ((this.data[y] || [])[x])
      return this.data[y][x];
    else
      return { id: 0, dec: 0 };
  }

  draw(ctx, x, y, dx, dy) {
    let tile = this.get(x, y);

    // If the tileset/tile is missing, draw an error texure and cancel the function
    if (!Tile.types[tile.id]) {
      ctx.fillStyle = "#ff00ff";
      ctx.fillRect(dx, dy, 16, 16);
      return;
    }

    // Get all needed tile information
    let tileType = Tile.types[tile.id];
    let tileset = tileType.tileset;
    let merge = Tile.id[tileType.merge];


    // Drawing walls
    let below = Tile.types[this.get(x, y + 1).id];
    if (below.solid) {
      below.tileset.drawTile(ctx, 3, 0, dx, dy); return;
    } else if (tileType.solid) {
      if (this.checkWalls([1, 1], x, y))
        tileset.drawTile(ctx, 1, 0, dx, dy);

      if (this.checkWalls([0, 1], x, y))
        tileset.drawTile(ctx, 0, 0, dx, dy);

      if (this.checkWalls([1, 0], x, y))
        tileset.drawTile(ctx, 2, 0, dx, dy);

      return;
    }

    // Drawing normal tiles //
    let coords = [];

    // Full block
    if (this.check([0, 0, 0, 0], merge, x, y)) {
      coords = [0 + tile.dec % 4, 4 + ~~(tile.dec / 4)];
    }

    // Top edge
    if (this.check([1, 0, 0, 0], merge, x, y))
      coords = [1, 0];

    // Bottom edge
    if (this.check([0, 0, 0, 1], merge, x, y))
      coords = [1, 2];

    // Left edge
    if (this.check([0, 1, 0, 0], merge, x, y))
      coords = [0, 1];

    //Right edge
    if (this.check([0, 0, 1, 0], merge, x, y))
      coords = [2, 1]

    //Top left corner
    if (this.check([1, 1, 0, 0], merge, x, y))
      coords = [0, 0]

    //Top right corner
    if (this.check([1, 0, 1, 0], merge, x, y))
      coords = [2, 0]

    //Bottom left corner
    if (this.check([0, 1, 0, 1], merge, x, y))
      coords = [0, 2]

    //Bottom right corner
    if (this.check([0, 0, 1, 1], merge, x, y))
      coords = [2, 2]

    //Horizontal midsection
    if (this.check([1, 0, 0, 1], merge, x, y))
      coords = [1, 3]

    //Left stub
    if (this.check([1, 1, 0, 1], merge, x, y))
      coords = [0, 3]

    //Right stub
    if (this.check([1, 0, 1, 1], merge, x, y))
      coords = [2, 3]

    //Vertical midsection
    if (this.check([0, 1, 1, 0], merge, x, y))
      coords = [3, 1]

    //Top stub
    if (this.check([1, 1, 1, 0], merge, x, y))
      coords = [3, 0]

    //Bottom stub
    if (this.check([0, 1, 1, 1], merge, x, y))
      coords = [3, 2]

    //Bottom stub
    if (this.check([1, 1, 1, 1], merge, x, y))
      coords = [3, 3]

    tileset.drawTile(ctx, coords[0], coords[1], dx, dy);
  }

  check(arr, t, x, y) {
    // Normal tiles
    return (
      (this.get(x, y - 1).id == t) == arr[0] &&
      (this.get(x - 1, y).id == t) == arr[1] &&
      (this.get(x + 1, y).id == t) == arr[2] &&
      (this.get(x, y + 1).id == t) == arr[3]
    );
  }

  checkWalls(arr, x, y) {
    return (
      (Tile.types[this.get(x - 1, y).id].solid) == arr[0] &&
      (Tile.types[this.get(x + 1, y).id].solid) == arr[1]
    );
  }
}