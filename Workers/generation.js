console.debug("Worker created!");

// Load in the Perlin module //
self.importScripts('../Static/perlin.js');

onmessage = function (e) {
  var settings = e.data[0];

  var width = e.data[1];
  var height = e.data[2];

  var data = [];
  var perlin = new Perlin();
  var pondPerlin = new Perlin();

  console.debug("(worker) Generating world...")
  for (let y = 0; y < height; y++) {
    data.push([]);

    for (let x = 0; x < width; x++) {
      // Fetch a number from 0 to 1 from the perlin noise //
      let p = (perlin.get(y * settings.scale + 0.5, x * settings.scale + 0.5) + 1) / 2;
      let cur;

      // Ocean
      if (p <= settings.ocean) { cur = { type: 'water', dec: 0 }; }

      // Beaches
      else if (p > settings.ocean && p <= settings.sand) {
        cur = {
          type: 'sand',
          dec: Math.round(Math.random() * 0.55) * ~~(Math.random() * 3)
        };
      }

      // Land
      else if (p > settings.sand && p <= settings.grass) {
        let w = pondPerlin.get(x * settings.pondScale + 0.5, y * settings.pondScale + 0.5);

        if (w > 0.3 && p > settings.sand + 0.05)
          cur = { type: 'water', dec: 0 };
        else {
          let random = ~~(Math.random() * 3) + Math.round(Math.random() * 0.55) * 3;

          cur = {
            type: 'grass',
            dec: random
          };
        }
      }

      // Mountains
      else { cur = { type: 'stone', dec: 0 }; }

      // Push the generated tile to the world array //
      data[y].push(cur);
    }

    // Figure out what percent of generation is completed, then send it over to the main thread //
    let p = ((y + 1) * width) / (width * height) * 100;
    this.postMessage(['UI', p]);

  }

  // Return the generated data array //
  console.debug("(worker) Finished, sending data back to main thread")
  this.postMessage(['data', data]);
}