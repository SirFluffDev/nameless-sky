import * as UI from "./ui.mjs";

/**
 * A class to store an instance of an item
 */
export default class Item {
  // The list of all items
  static list = [];

  // The different use cases of items
  static classes = {
    food: (item, player) => {
      const itemType = Item.list[item.id];

      if (itemType.healAmount > 0) player.heal(itemType.healAmount);
      if (itemType.feedAmount > 0) player.feed(itemType.feedAmount);
      item.count--;

      UI.update(player);
    }
  }

  /**
   * An instance of an item
   * @param {number} id - The id of the item
   * @param {number} count - The amount of the item
   */
  constructor(id, count = 1) {
    this.id = id;
    this.count = count;
  }

  /**
   * Use an item
   * @param {Player} player - The player affected by the item's usage
   */
  use(player) {
    if (this.count <= 0 || !Item.classes.hasOwnProperty(Item.list[this.id].type)) return;

    // Check if the item has a use event - If so, run it
    Item.classes[Item.list[this.id].type](this, player);
  }
}

// Load all item types
const itemData = await (
  await fetch("./Data/items.json")
).json();

for (let i = 0; i < itemData.length; i++) { Item.list.push(itemData[i]); }
console.log("Loaded items!", Item.list);