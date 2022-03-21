/**
 * Loads an image asynchronously using promises and callbacks
 * @param {String} src - Image URL to load from
 */

export function loadImageAsync(src) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  })
}

export class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  normalize() {
    let m = this.magnitude()

    this.x /= m;
    this.y /= m;

    return this;
  }
}