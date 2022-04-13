import { loadImageAsync } from "./Classes/utility.mjs";

console.log("Initializing...")

// Get the canvas scale
const SCALE = Math.min(
  Math.floor(window.innerWidth / 240),
  Math.floor(window.innerHeight / 144)
);

// Setup the container
const container = document.getElementById("container");
container.style.width = `${240 * SCALE}px`;
container.style.height = `${144 * SCALE}px`;

// Add an easy clear function to html canvases
CanvasRenderingContext2D.prototype.clear = function () { this.clearRect(0, 0, this.canvas.width, this.canvas.height); }

// Load all canvases into a layer object
let layers = {};
const layersObj = container.children;
for (let i = 0; i < layersObj.length; i++) {
  let c = layersObj[i];

  if (c.nodeName !== "CANVAS") { continue; }

  c.width = 256;
  c.height = 160;
  c.style.width = c.width * SCALE + 'px';
  c.style.height = c.height * SCALE + 'px';

  const name = c.getAttribute('layername');
  const alpha = ((c.getAttribute('alpha') || null) == 'true');

  // Add canvas context to layer array
  layers[name] = c.getContext('2d', {
    alpha: alpha
  });
}

layers.UI.font = '4px pixel';
layers.UI.fillText("I am a block of text!", 10, 10);

console.debug("Loaded all layers");

// Save global values
window['game'] = {
  SCALE: SCALE,
  TILE_SIZE: 16,
  LAYERS: layers,
  CONTAINER: container
};

console.debug("...Initialized!");