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