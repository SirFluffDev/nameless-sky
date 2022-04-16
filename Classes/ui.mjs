import { loadImageAsync } from "./utility.mjs";

import Item from "./item.mjs";

// Load UI layer and spritesheet
const
  CTX = window['game'].LAYERS.UI,
  UI_SHEET = await loadImageAsync("./Assets/ui.png"),
  ITEM_SHEET = await loadImageAsync("./Assets/items.png"),
  SETTINGS = window['game'].SETTINGS;

console.debug("Imported item sheet!", UI_SHEET);
CTX.font = '4px pixel';

/**
 * Update every UI element
 * @param {Player} player - The player object to update the UI with
 */
export function update(player) {
  for (let i = 0; i < 10; i++) {
    CTX.drawImage(UI_SHEET, 0, 0, 8, 8, 2 + i * 8, 2, 8, 8);
    CTX.drawImage(UI_SHEET, 0, 8, 8, 8, 2 + i * 8, 10, 8, 8);
  }
}

/**
 * Update the HUD's inventory display
 * @param {Inventory} - An inventory instance
 */
export function updateInventory(inv) {
  for (let i = 0; i < 10; i++) {
    const
      dx = 2 + i * 17,
      dy = CTX.canvas.height - 18;

    CTX.drawImage(UI_SHEET, (i === inv.selectedSlot ? 16 : 0), 16, 16, 16, dx, dy, 16, 16);

    if (inv.items[i].count > 0) {
      CTX.drawImage(ITEM_SHEET, inv.items[i].id * 8, 0, 8, 8, dx + 4, dy + 4, 8, 8);
      drawText(inv.items[i].count, dx + (inv.items[i].count > 9 ? 5 : 10), dy + 14);
    }
  }

  CTX.clearRect(2 - SETTINGS.textShadow, CTX.canvas.height - 26, CTX.canvas.width, 4 + SETTINGS.textShadow);

  if (inv.items[inv.selectedSlot].count > 0) {
    drawText(`${Item.types[inv.selectedSlot].name} (x${inv.items[inv.selectedSlot].count})`, 3, CTX.canvas.height - 22);
  }
}

/**
 * Draw pixel text with a drop shadow (On the UI canvas)
 * @param {string} text
 * @param {number} dx
 * @param {number} dy
 */
export function drawText(text, dx, dy) {
  if (SETTINGS.textShadow) {
    CTX.fillStyle = "#000000";
    CTX.fillText(text, dx - 1, dy + 1);
  }

  CTX.fillStyle = "#ffffff";
  CTX.fillText(text, dx, dy);
}