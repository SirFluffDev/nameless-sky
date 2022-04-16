/**
 * Class for handling items
 */
export default class Item {
  static types = [];
  static id = {};

  constructor(id, count = 1) {
    this.id = id;
    this.count = count;
  }

  /** 
   * Create a new type of item
   * @param {object} properties - The item's properties
   * 
   * @param {string} properties.name - The item's name
   * @param {number} properties.maxStack - The maximum stack size of the item
   */
  static createType(properties) {
    Item.id[properties.name] = Item.types.length;
    Item.types.push(properties);
  }
}

// Load all item types
const itemData = await (
  await fetch("./Data/items.json")
).json();

for (let i = 0; i < itemData.length; i++) { Item.createType(itemData[i]); }
console.log("Loaded items!", Item.types);