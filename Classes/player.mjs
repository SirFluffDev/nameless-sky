import * as Input from "./input.mjs";
import { Vector } from "./utility.mjs";

export default class Player {
  constructor() {
    this.x = 0;
    this.y = 0;

    this.xVel = 0;
    this.yVel = 0;

    this.speed = 0.2;
    this.friction = 0.8;
  }

  update(canvas, world, d) {

    this.xVel +=
      ((Input.keys.includes("KeyD") || Input.keys.includes("ArrowRight")) -
        (Input.keys.includes("KeyA") || Input.keys.includes("ArrowLeft"))) * this.speed;

    this.yVel +=
      ((Input.keys.includes("KeyS") || Input.keys.includes("ArrowDown")) -
        (Input.keys.includes("KeyW") || Input.keys.includes("ArrowUp"))) * this.speed;

    this.x += this.xVel;
    this.y += this.yVel;

    this.xVel *= this.friction;
    this.yVel *= this.friction;

    this.x = Math.max(this.x, 0)
    this.y = Math.max(this.y, 0)

    if (Math.abs(this.xVel) < 0.16) this.xVel = 0;

    let px = -~~(this.x) % 16 * 4;
    let py = -~~(this.y) % 16 * 4;

    if (this.x > 7 * 16)
      canvas.style.left = px + 'px';

    if (this.y >= 4 * 16)
      canvas.style.top = py + 'px';
  }
}