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
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)
  }

  normalize() {
    if (this.x || this.y) {
      let m = this.magnitude();

      this.x /= m;
      this.y /= m;

      return this;
    }
  }

  toDegrees() {
    // Calculate radians
    let radians = Math.atan2(this.y, this.x);

    // Make radians positive
    if (radians < 0) {
      radians += 2 * Math.PI;
    }

    // Return number in degrees
    return radians * 180 / Math.PI;
  }
}