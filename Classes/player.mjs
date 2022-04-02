import * as Input from "./input.mjs";

let scale;

/**
 * A simple class used to manage a player
 * @param {Image} spritesheet - The spritesheet to use for the player
 */
export default class Player {
  constructor(spritesheet, x = 0, y = 0) {
    this.x = x;
    this.y = y;

    // Movement variables
    this.speed = 1;
    this.moving = false;

    // Information used to draw the player
    this.spritesheet = spritesheet;
    this.direction = 0;
    this.timestamp = 0;

    this.animationStart = 0;
  }

  /**
   * Update all the player's information, and adjust the screen offset
   * @param {HTMLCanvasElement} canvas 
   * @param {World} world 
   * @param {DOMHighResTimeStamp} timestamp 
   */
  update(canvas, world, timestamp) {
    this.timestamp = timestamp;

    // Get the canvas scale
    if (!scale) scale = parseInt(canvas.style.width, 10) / 256;

    // Move player based off user input
    const joyVec = Input.getJoystickVector(0);
    this.x += joyVec.x * this.speed;
    this.y += joyVec.y * this.speed;

    // Update direction when the joystick has moved
    if (joyVec.x !== 0 || joyVec.y !== 0) {
      if (!this.moving) this.animationStart = timestamp;

      this.moving = true;
      /* Left  */ if (joyVec.x < 0) this.direction = 2;
      /* Right */ else if (joyVec.x > 0) this.direction = 3;
      /* Down  */ else if (joyVec.x === 0 && joyVec.y > 0) this.direction = 0;
      /* Up    */ else if (joyVec.x === 0 && joyVec.y < 0) this.direction = 1;
    } else {
      this.moving = false;
    }

    // Apply friction to velocity
    this.xVel *= this.friction;
    this.yVel *= this.friction;

    // Stop player from crossing the world border
    this.x = Math.max(this.x, 0);
    this.y = Math.max(this.y, 0);

    // Offset the world based on player position
    if (this.x > 7 * 16)
      canvas.style.left = -Math.floor(this.x) % 16 * scale + 'px';
    else
      canvas.style.left = 0;

    if (this.y >= 4 * 16)
      canvas.style.top = -Math.floor(this.y) % 16 * scale + 'px';
    else
      canvas.style.top = 0;
  }

  // Draw and animate the player onscreen
  draw(ctx, px, py) {
    let dx = this.moving ? ~~((this.timestamp - this.animationStart) / (200 / this.speed)) % 2 + 1 : 0;

    ctx.drawImage(
      this.spritesheet,

      dx * 16, this.direction * 16, 16, 16,

      px, py, 16, 16
    );
  }
}