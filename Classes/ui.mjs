import { loadImageAsync } from "./utility.mjs";

import Item from "./item.mjs";

// Load UI layer and spritesheet
const
  CTX = window.game.LAYERS.UI,
  UI_SHEET = await loadImageAsync("./Assets/ui.png"),
  ITEM_SHEET = await loadImageAsync("./Assets/items.png"),
  SETTINGS = window.game.SETTINGS;

console.debug("Imported item sheet!", UI_SHEET);
CTX.font = '4px pixel';

/**
 * Update every UI element
 * @param {Player} player - The player object to update the UI with
 */
export function update(player) {
  switch (SETTINGS.statDisplay) {
    case "symbols":
      for (let i = 0; i < player.maxHealth / 2; i++) {
        CTX.drawImage(
          UI_SHEET,
          (player.health - i * 2 === 1) ? 8 : (i * 2 >= player.health ? 16 : 0),
          0, 8, 8, 2 + i * 8, 2, 8, 8
        );
      }

      for (let i = 0; i < player.maxHunger / 2; i++) {
        CTX.drawImage(
          UI_SHEET,
          (player.hunger - i * 2 === 1) ? 8 : (i * 2 >= player.hunger ? 16 : 0),
          8, 8, 8, 2 + i * 8, 10, 8, 8
        );
      }
      break;

    case "bars":
      // Health
      CTX.fillStyle = "#1a1c2c";
      CTX.fillRect(2, 2, player.maxHealth + 2, 6);
      CTX.fillRect(2, 9, player.maxHunger + 2, 6);

      CTX.fillStyle = "#b13e53";
      CTX.fillRect(3, 3, player.health, 4);

      CTX.fillStyle = "#ffcd75";
      CTX.fillRect(3, 10, player.hunger, 4);

      drawText("HP", 3, 7, false);
      drawText("EN", 3, 14, false);
      break;
  }
}

/**
 * Update the HUD's inventory display
 * @param {Inventory} - An inventory instance
 */
export function updateInventory(inv) {
  // Loop through all of the player's hotbar slots
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

  // Clear out the old text and write new text
  CTX.clearRect(2 - SETTINGS.textShadow, CTX.canvas.height - 36, CTX.canvas.width, 14 + SETTINGS.textShadow);

  // Write item name, count, and other properties on the hotbar
  const currentItem = inv.items[inv.selectedSlot];
  const currentItemType = Item.list[currentItem.id];

  if (currentItem.count > 0 && currentItem.id > -1) {
    drawText(`${Item.list[currentItem.id].name} (x${currentItem.count})`, 3, CTX.canvas.height - 22);

    if (currentItemType.type === "food") {
      switch (SETTINGS.statDisplay) {
        case "symbols":
          // Draw health icons
          if (currentItemType.healAmount > 0) {
            for (let i = 0; i < Math.ceil(currentItemType.healAmount / 2); i++) {
              CTX.drawImage(
                UI_SHEET,
                (currentItemType.healAmount - i * 2 === 1) ? 8 : 0,
                0, 8, 8, 2 + i * 8, CTX.canvas.height - 36, 8, 8
              );
            }
          }

          // Draw hunger icons
          if (currentItemType.feedAmount > 0) {
            for (let i = 0; i < Math.ceil(currentItemType.feedAmount / 2); i++) {
              CTX.drawImage(
                UI_SHEET,
                (currentItemType.feedAmount - i * 2 === 1) ? 8 : 0,
                8, 8, 8, 2 + (i + Math.ceil(currentItemType.healAmount / 2)) * 8, CTX.canvas.height - 36, 8, 8
              );
            }
          }
          break;

        case "bars":
          CTX.fillStyle = "#1a1c2c";
          CTX.fillRect(2, CTX.canvas.height - 34, currentItemType.healAmount + 2, 6);
          CTX.fillRect(5 + currentItemType.healAmount, CTX.canvas.height - 34, currentItemType.feedAmount + 2, 6);

          CTX.fillStyle = "#b13e53";
          CTX.fillRect(3, CTX.canvas.height - 33, currentItemType.healAmount, 4);

          CTX.fillStyle = "#ffcd75";
          CTX.fillRect(6 + currentItemType.healAmount, CTX.canvas.height - 33, currentItemType.feedAmount, 4);
          break;
      }
    }
  }
}

/**
 * Draw pixel text with a drop shadow (On the UI canvas)
 * @param {string} text
 * @param {number} dx
 * @param {number} dy
 */
export function drawText(text, dx, dy, shadow = null) {
  if ((SETTINGS.textShadow || shadow === true) && shadow !== false) {
    CTX.fillStyle = "#000000";
    CTX.fillText(text, dx - 1, dy + 1);
  }

  CTX.fillStyle = "#ffffff";
  CTX.fillText(text, dx, dy);
}