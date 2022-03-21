import * as Input from "./input.mjs";
import { Vector } from "./utility.mjs";

export default class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
  }

  update(canvas, world, d) {

    this.x +=
      (Input.keys.includes("KeyD") || Input.keys.includes("ArrowRight")) -
      (Input.keys.includes("KeyA") || Input.keys.includes("ArrowLeft"));

    this.y +=
      (Input.keys.includes("KeyS") || Input.keys.includes("ArrowDown")) -
      (Input.keys.includes("KeyW") || Input.keys.includes("ArrowUp"));

    this.x = Math.max(this.x, 0)
    this.y = Math.max(this.y, 0)

    let px = -~~(this.x) % 16 * 4;
    let py = -~~(this.y) % 16 * 4;

    if (this.x > 7 * 16)
      canvas.style.left = px + 'px';

    if (this.y >= 4 * 16)
      canvas.style.top = py + 'px';
  }
}