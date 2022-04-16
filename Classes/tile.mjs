/** Class used for both types of tiles and instances of them */
class Tile {
  static types = [];
  static id = {};

  /** 
   * Create a new type of tile 
   * @param {object} properties - The Tile's properties
   * 
   * @param {string} properties.name - The tile's name
   * @param {Array} properties.atlas - The x and y location on the sprite atlas
   * @param {number} properties.decs - The amount of tile variations that can be used
   * @param {string} properties.merge - The type of tile it connects to
   * @param {boolean} properties.solid - How the tile is treated (Flooring, walls, etc.)
   */
  static create(properties) {
    Tile.id[properties.name] = Tile.types.length;
    Tile.types.push(properties);
  }
}

// Load all tile types
const tileData = await (
  await fetch("./Data/tiles.json")
).json();

for (let i = 0; i < tileData.length; i++) { Tile.create(tileData[i]); }
console.log("Loaded tiles!");

class Tileset {
  constructor(img, res) {
    this.img = img;
    this.res = res;
  }

  drawTile(ctx, tileX, tileY, dx, dy, id) {
    ctx.drawImage(
      this.img,
      (tileX + (id * 4)) * this.res, tileY * this.res, this.res, this.res,
      dx, dy, this.res, this.res
    );
  }
}

export { Tile, Tileset }