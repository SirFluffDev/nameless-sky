console.debug("Worker created!");

// Load in the Perlin module //
self.importScripts('../Classes/Static/perlin.js');

onmessage = function (e) {
  let settings = e.data[0];

  let width = e.data[1];
  let height = e.data[2];

  let data = [];
  let perlin = new Perlin();
  let pondPerlin = new Perlin();
  let decPerlin = new Perlin();

  console.debug("(worker) Generating world...")
  for (let y = 0; y < height; y++) {
    data.push([]);

    for (let x = 0; x < width; x++) {
      // Fetch a number from 0 to 1 from the perlin noise //
      let p = (perlin.get(y * settings.scale + 0.5, x * settings.scale + 0.5) + 1) / 2;
      let cur;

      // Ocean
      if (p <= settings.ocean) { cur = { id: 0, dec: 0 }; }

      // Beaches
      else if (p > settings.ocean && p <= settings.sand) {
        cur = {
          id: 2,
          dec: Math.round(Math.random() * 0.55) * ~~(Math.random() * 3)
        };
      }

      // Land
      else if (p > settings.sand && p <= settings.grass) {
        let w = pondPerlin.get(x * settings.pondScale + 0.5, y * settings.pondScale + 0.5);

        // Create random ponds on land
        if (w > 0.3 && p > settings.sand + 0.05)
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

    // Figure out what percent of generation is completed, then send it over to the main thread //
    let p = ((y + 1) * width) / (width * height) * 100;
    this.postMessage(['UI', p]);

  }

  // Return the generated data array //
  console.debug("(worker) Finished, sending data back to main thread")
  this.postMessage(['data', data]);
}