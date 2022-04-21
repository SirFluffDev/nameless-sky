console.debug("Worker created!");

//#region - Perlin noise
class Perlin {
  constructor() {
    this.gradients = {};
    this.memory = {};
  }

  // Utility functions //
  static rand_vect() {
    let theta = Math.random() * 2 * Math.PI;
    return {
      x: Math.cos(theta),
      y: Math.sin(theta)
    };
  }

  static smootherstep(x) {
    return 6 * Math.pow(x, 5) - 15 * Math.pow(x, 4) + 10 * Math.pow(x, 3);
  }

  static interp(x, a, b) {
    return a + Perlin.smootherstep(x) * (b - a);
  }

  dot_prod_grid(x, y, vx, vy) {
    let g_vect;
    let d_vect = {
      x: x - vx,
      y: y - vy
    };
    if (this.gradients[[vx, vy]]) {
      g_vect = this.gradients[[vx, vy]];
    } else {
      g_vect = Perlin.rand_vect();
      this.gradients[[vx, vy]] = g_vect;
    }

    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  }

  // Return values //
  get(x, y) {
    //if (this.memory.hasOwnProperty([x,y]))
    //  return this.memory[[x,y]];

    let xf = Math.floor(x);
    let yf = Math.floor(y);

    // Interpolate //
    let tl = this.dot_prod_grid(x, y, xf, yf);
    let tr = this.dot_prod_grid(x, y, xf + 1, yf);
    let bl = this.dot_prod_grid(x, y, xf, yf + 1);
    let br = this.dot_prod_grid(x, y, xf + 1, yf + 1);
    let xt = Perlin.interp(x - xf, tl, tr);
    let xb = Perlin.interp(x - xf, bl, br);
    let v = Perlin.interp(y - yf, xt, xb);

    //this.memory[[x,y]] = v;
    return v;
  }
}
//#endregion

onmessage = function (e) {
  const
    SETTINGS = e.data[0],
    WIDTH = e.data[1],
    HEIGHT = e.data[2];

  let data = [];

  const perlin = new Perlin();
  let pondPerlin = new Perlin();
  let decPerlin = new Perlin();

  console.debug("(worker) Generating world...");

  for (let y = 0; y < HEIGHT; y++) {
    data.push([]);

    for (let x = 0; x < WIDTH; x++) {
      // Fetch a number from 0 to 1 from the perlin noise //
      let p = (perlin.get(y * SETTINGS.scale + 0.5, x * SETTINGS.scale + 0.5) + 1) / 2;
      let cur;

      // Ocean
      if (p <= SETTINGS.ocean) { cur = { id: 0, dec: 0 }; }

      // Beaches
      else if (p > SETTINGS.ocean && p <= SETTINGS.sand) {
        cur = {
          id: 2,
          dec: Math.round(Math.random() * 0.55) * ~~(Math.random() * 4)
        };
      }

      // Land
      else if (p > SETTINGS.sand && p <= SETTINGS.grass) {
        let w = pondPerlin.get(x * SETTINGS.pondScale + 0.5, y * SETTINGS.pondScale + 0.5);

        // Create random ponds on land
        if (w > 0.3 && p > SETTINGS.sand + 0.05)
          cur = { id: 0, dec: Math.round(Math.random() * 0.7) };

        else {
          // Select a random decoration for the tile
          let decScale = 0.17;
          let dec = (decPerlin.get(x * decScale + 0.5, y * decScale + 0.5) + 1) / 2;

          // Flower patches
          if (dec > 0.7) {
            cur = {
              id: 1,
              dec: 5 + Math.round(Math.random() * 2)
            }

          } else {
            // Grass
            cur = {
              id: 1,
              dec: ~~(Math.random() * 4 + Math.round(Math.random() * 0.6))
            };
          }
        }
      }

      // Mountains
      else { cur = { id: 3, dec: 0 }; }

      // Push the generated tile to the world array //
      data[y].push(cur);
    }

    // Update loading bar percentage //
    this.postMessage(((y + 1) * WIDTH) / (WIDTH * HEIGHT) * 100);
  }

  // Return the generated data array //
  console.debug("(worker) Finished, sending data back to main thread")
  this.postMessage(data);
}