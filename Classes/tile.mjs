/** Class used for both types of tiles and instances of them */
class Tile {
  static types = [];
  static id = {};

  /** 
   * Create a new type of tile 
   * @param {object} properties - The Tile's properties
   * 
   * @param {string} properties.name - The tile's name
   * @param {Tileset} properties.tileset - The tileset used for the tile
   * @param {number} properties.decs - The amount of tile variations that can be used
   * @param {string} properties.merge - The type of tile it connects to
   */
  static create(properties) {
    Tile.id[properties.name] = Tile.types.length;
    Tile.types.push(properties);
  }
}

class Tileset {
  constructor(img, res) {
    this.img = img;
    this.res = res;
  }

  drawTile(ctx, tileX, tileY, dx, dy) {
    ctx.drawImage(
      this.img,
      tileX * this.res, tileY * this.res, this.res, this.res,
      dx, dy, this.res, this.res
    );
  }
}

export { Tile, Tileset }