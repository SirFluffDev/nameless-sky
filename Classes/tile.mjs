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

class Tileset {
  constructor(img, res) {
    this.img = img;
    this.res = res;
  }

  drawTile(ctx, tileX, tileY, dx, dy, atlas) {
    ctx.drawImage(
      this.img,
      (tileX + (atlas[0] * 4)) * this.res, (tileY + (atlas[1] * 6)) * this.res, this.res, this.res,
      dx, dy, this.res, this.res
    );
  }
}

export { Tile, Tileset }