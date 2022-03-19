/** Class used for both types of tiles and instances of them */
class Tile {
  static types = {};

  /** 
   * Create a new type of tile 
   * @param {string} name - The tile's name
   * @param {Number} decs - The amount of tile variations that can be used
   * @param {String} merge - The type of tile it connects to
   * @param {Tileset} tileset - The tileset used for the tile
   */
  static create(name, decs, merge, tileset) {
    Tile.types[name] = {
      tileset: tileset,
      decs: decs,
      merge: merge
    }
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