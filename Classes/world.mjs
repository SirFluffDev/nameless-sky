// Import perlin noise library for worldgen
import { Tile } from "./tile.mjs";

// Loading screen
const
  loadingScreen = document.getElementById("loading"),
  loadingBar = loadingScreen.children[0].children[0];

const
  bottomLayer = window['game'].LAYERS.world,
  topLayer = window['game'].LAYERS.top;

/**
 * A simple class used to create and store arrays of tiles
 */
export default class World {
  data = [];

  /**
   * Create an empty world 
   * @param {string} name - The name of the world
   * @param {Number} width - The world's width in tiles
   * @param {Number} height - The world's height in tiles
   * @param {Tileset} tileset - The tileset that the world uses to draw
  */
  constructor(name, width, height, tileset) {
    this.name = name;

    this.width = width;
    this.height = height;

    this.tileset = tileset;
  }

  /**
   * Returns a tile from world coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Tile} The tile object at the given coordinates
   */
  get(x, y) {
    if ((this.data[y] || [])[x])
      return this.data[y][x];
    else
      return { id: 0, dec: 0 };
  }

  //#region - World generation
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
    const self = this;
    loadingScreen.childNodes[0].nodeValue = `Generating world...`;

    return new Promise((resolve, reject) => {
      let start = performance.now()

      // Create and run a worker for worldgen //
      let generationWorker = new Worker(location.href + "Workers/generation.js");
      generationWorker.postMessage([settings, this.width, this.height]);

      // Update the progress bar //
      generationWorker.onmessage = function (e) {
        if (e.data[0] == 'data') {
          loadingScreen.setAttribute('hidden', true);
          console.log(`Finished generating in ${performance.now() - start}ms`)

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
  //#endregion

  //#region - Drawing
  draw(x, y, dx, dy) {
    const tile = this.get(x, y);

    // If the tileset/tile is missing, draw an error texure and cancel the function
    if (!Tile.types[tile.id]) {
      bottomLayer.fillStyle = "#ff00ff";
      bottomLayer.fillRect(dx, dy, 16, 16);
      return;
    }

    // Get all needed tile information
    const
      tileType = Tile.types[tile.id],
      merge = Tile.id[tileType.merge];

    let coords = [];

    // Drawing walls
    let below = this.get(x, y + 1);

    if (Tile.types[below.id].solid) {
      this.tileset.drawTile(topLayer, 3, 0, dx, dy, below.id); return;
    } else if (tileType.solid) {
      if (this.checkWalls([1, 1], x, y)) coords = [1, 0];
      if (this.checkWalls([0, 1], x, y)) coords = [0, 0];
      if (this.checkWalls([1, 0], x, y)) coords = [2, 0];

      this.tileset.drawTile(bottomLayer, coords[0], coords[1], dx, dy, tile.id);

      return;
    }

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

    this.tileset.drawTile(bottomLayer, coords[0], coords[1], dx, dy, tile.id);
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
  //#endregion
}