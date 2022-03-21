import * as Input from "./input.mjs";
import { Vector } from "./utility.mjs";

import { loadImageAsync } from "./utility.mjs";

/**
 * A simple class used to manage a player
 * @param {Image} spritesheet - The spritesheet to use for the player
 */
export default class Player {
  constructor(spritesheet) {
    this.x = 0;
    this.y = 0;

    // Movement variables
    this.friction = 0.8;
    this.speed = 0.2;
    this.xVel = 0;
    this.yVel = 0;

    // Information used to draw the player
    this.spritesheet = spritesheet;
    this.direction = 0;
    this.timestamp = 0;

    this.animationStart = 0;
  }

  update(canvas, world, timestamp) {
    this.timestamp = timestamp;
    let moving = new Vector(this.xVel, this.yVel).magnitude() > 0.2;

    // Get the tile the player is standing on
    let currentTile = world.get(
      ~~(this.x / 16), ~~(this.y / 16)
    );

    // Adjust velocity and direction based off keyboard input
    if ((Input.keys.includes("KeyS") || Input.keys.includes("ArrowDown"))) {
      this.direction = 0;
      this.yVel += this.speed;
      if (!moving) this.animationStart = this.timestamp;
    }

    if ((Input.keys.includes("KeyW") || Input.keys.includes("ArrowUp"))) {
      this.direction = 1;
      this.yVel -= this.speed;
      if (!moving) this.animationStart = this.timestamp;
    }

    if ((Input.keys.includes("KeyA") || Input.keys.includes("ArrowLeft"))) {
      this.direction = 2;
      this.xVel -= this.speed;
      if (!moving) this.animationStart = this.timestamp;
    }

    if ((Input.keys.includes("KeyD") || Input.keys.includes("ArrowRight"))) {
      this.direction = 3;
      this.xVel += this.speed;
      if (!moving) this.animationStart = this.timestamp;
    }

    // Move player based off velocity
    this.x += this.xVel;
    this.y += this.yVel;

    // Apply friction to velocity
    this.xVel *= this.friction;
    this.yVel *= this.friction;

    // Stop player from crossing the world border
    this.x = Math.max(this.x, 0)
    this.y = Math.max(this.y, 0)

    if (Math.abs(this.xVel) < 0.16) this.xVel = 0;

    // Calculate world offset from player position
    let px = -~~(this.x) % 16 * 4;
    let py = -~~(this.y) % 16 * 4;

    if (this.x > 7 * 16)
      canvas.style.left = px + 'px';

    if (this.y >= 4 * 16)
      canvas.style.top = py + 'px';
  }

  draw(ctx, px, py) {
    let moving = (new Vector(this.xVel, this.yVel).magnitude() > 0.2);

    let dx = 0;

    dx = moving ? ~~((this.timestamp - this.animationStart) / 200) % 2 + 1 : 0;

    ctx.drawImage(
      this.spritesheet,

      dx * 16, this.direction * 16, 16, 16,

      px, py, 16, 16
    );
  }
}