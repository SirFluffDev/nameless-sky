console.log("Initializing...")

// Get the canvas scale
const SCALE = Math.min(
  Math.floor(window.innerWidth / 240),
  Math.floor(window.innerHeight / 144)
);

// CSS Modification
document.documentElement.style.setProperty('--scale', SCALE + 'px');

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

  c.style.width = c.width * SCALE + 'px';
  c.style.height = c.height * SCALE + 'px';

  const name = c.getAttribute('layername');
  const alpha = ((c.getAttribute('alpha') || null) == 'true');

  // Add canvas context to layer array
  layers[name] = c.getContext('2d', {
    alpha: alpha
  });
}

console.debug("Loaded all layers");

// Save global values
window['game'] = {
  SCALE: SCALE,
  TILE_SIZE: 16,
  LAYERS: layers,
  CONTAINER: container,
  SETTINGS: {
    textShadow: true,
    statDisplay: "symbols"
  }
};

console.log("...Initialized!");