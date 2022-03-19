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