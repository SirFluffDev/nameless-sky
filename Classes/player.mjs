import * as Utility from "./utility.mjs";
import * as Input from "./input.mjs";
import { Tile } from "./tile.mjs";

import Item from "./item.mjs";

import * as UI from "./ui.mjs";

// Load global variables
const
  TILE_SIZE = window['game'].TILE_SIZE,
  SCALE = window['game'].SCALE;

export class Inventory {
  slots = 9;
  selectedSlot = 0;

  items = [
    new Item(0, 2),
    new Item(1, 5),
    new Item(2, 3),
    new Item(3, 7),
    new Item(4, 2),
    new Item(5, 6),
    new Item(6, 4),
    new Item(7, 1),
    new Item(8, 9),
    new Item(-1, 0)
  ];

  /**
   * Add an item or multiple of an item to an inventory
   * @param {Item} item - The item to add (String, item id, or item object)
   * @param {number} count - The count of the item (Optional)
   */
  give(item, count = 1) {
    if (typeof item === 'string') {
      if (Item.id[item] === undefined) { console.error("Invalid item!"); return; }
      item = new Item(Item.id[item], count);
      console.log("Parsed item:", item);
    } else if (typeof item === 'number') {
      item = new Item(item, count);
      console.log("Parsed item:", item);
    }

    let toGive = item.count;

    for (let i = 0; i < this.items.length; i++) {
      const slot = this.items[i];

      if (slot.count === 0) {
        this.items[i].id = item.id;
        this.items[i].count = toGive;
        break;
      } else if (slot.id === item.id) {
        if (slot.count + toGive > Item.types[slot.id].maxStack) {
          toGive -= (Item.types[slot.id].maxStack - slot.count);
          this.items[i].count = Item.types[slot.id].maxStack;
        } else {
          this.items[i].count += item.count;
          break;
        }
      }

      if (i === this.items.length - 1) {
        console.warn("The player's inventory is full!")
      }
    }

    UI.updateInventory(this);
  }
}

/**
 * A simple class used to manage a player
 * @property {Number} speed - The player's speed multiplier
 */
export default class Player {
  // Movement //
  direction = 0;
  timestamp = 0;

  animationStart = 0;

  cx = 0;
  cy = 0;

  speed = 1;
  moving = false;

  maxHealth = 20;
  health = 17;

  maxHunger = 20;
  hunger = 11;

  inventory = new Inventory();

  /**
   * Create a new player
   * @param {*} spritesheet - The spritesheet to use for the player
   * @param {number} x - The spawning X position of the player
   * @param {number} y - The spawning Y position of the player
   */
  constructor(spritesheet, x = 0, y = 0) {
    this.x = x;
    this.y = y;

    this.speed = 1;

    this.spritesheet = spritesheet;
  }

  /**
   * Update all the player's information, and adjust the screen offset
   * @param {HTMLCanvasElement} c1
   * @param {HTMLCanvasElement} c2
   * @param {World} world 
   * @param {DOMHighResTimeStamp} timestamp 
   */
  update(world, timestamp) {
    this.timestamp = timestamp;

    // Inventory slot changing
    if (Input.mouse.wheel !== 0) {
      const n = (this.inventory.selectedSlot + Input.mouse.wheel);

      if (n > 9) { this.inventory.selectedSlot = 0 }
      else if (n < 0) { this.inventory.selectedSlot = 9 }
      else { this.inventory.selectedSlot = n };

      UI.updateInventory(this.inventory);
    }

    // Cache previous position
    let xVel = 0, yVel = 0;

    //#region - Input management
    const joyVec = Input.getJoystickVector(0);
    if (Math.abs(joyVec.x) < 1) { this.cx += joyVec.x; } else { xVel += joyVec.x * this.speed; }
    if (Math.abs(joyVec.y) < 1) { this.cy += joyVec.y; } else { yVel += joyVec.y * this.speed; }

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

    // Make diagonal movement smooth
    if (joyVec.x === 0 || joyVec.y === 0) {
      this.cx = 0;
      this.cy = 0;
    }

    if (Math.abs(this.cx) > 1) { xVel += ~~(this.cx); this.cx = this.cx % 1; }
    if (Math.abs(this.cy) > 1) { yVel += ~~(this.cy); this.cy = this.cy % 1; }
    //#endregion

    //#region - Collision
    const newX = this.x + xVel, newY = this.y + yVel;

    const
      topLeft = world.get(Math.floor((newX + 3) / TILE_SIZE), Math.floor((newY + 14) / TILE_SIZE)),
      topRight = world.get(Math.floor((newX + 12) / TILE_SIZE), Math.floor((newY + 14) / TILE_SIZE)),
      bottomLeft = world.get(Math.floor((newX + 3) / TILE_SIZE), Math.floor((newY + 15) / TILE_SIZE)),
      bottomRight = world.get(Math.floor((newX + 12) / TILE_SIZE), Math.floor((newY + 15) / TILE_SIZE));

    // Moving up
    if (yVel < 0) {
      if (Tile.types[topLeft.id].solid || Tile.types[topRight.id].solid) {
        yVel = 0;
      }
    }

    // Moving down
    if (yVel > 0) {
      if (Tile.types[bottomLeft.id].solid || Tile.types[bottomRight.id].solid) {
        yVel = 0;
      }
    }

    // Moving Left
    if (xVel < 0) {
      if (Tile.types[topLeft.id].solid || Tile.types[bottomLeft.id].solid) {
        xVel = 0;
      }
    }

    // Moving right
    if (xVel > 0) {
      if (Tile.types[topRight.id].solid || Tile.types[bottomRight.id].solid) {
        xVel = 0;
      }
    }

    this.x += xVel;
    this.y += yVel;

    //#endregion

    // Stop player from crossing the world border
    this.x = Math.max(this.x, 0);
    this.y = Math.max(this.y, 0);

    const c1 = window['game'].LAYERS.world.canvas;
    const c2 = window['game'].LAYERS.top.canvas;

    // Offset the world based on player position
    if (this.x > 7 * TILE_SIZE) {
      c1.style.left = -Math.floor(this.x) % TILE_SIZE * SCALE + 'px';
      c2.style.left = -Math.floor(this.x) % TILE_SIZE * SCALE + 'px';
    } else {
      c1.style.left = 0;
      c2.style.left = 0;
    }

    if (this.y >= 4 * TILE_SIZE) {
      c1.style.top = -Math.floor(this.y) % TILE_SIZE * SCALE + 'px';
      c2.style.top = -Math.floor(this.y) % TILE_SIZE * SCALE + 'px';
    } else {
      c1.style.top = 0;
      c2.style.top = 0;
    }
  }

  // Draw and animate the player onscreen
  draw(ctx, px, py) {
    const dx = this.moving ? ~~((this.timestamp - this.animationStart) / (175 / this.speed)) % 2 + 1 : 0;

    ctx.drawImage(
      this.spritesheet,
      dx * 16, this.direction * 16, 16, 16,
      px, py, 16, 16
    );
  }
}