// Model
var path = require('path');
var Inventory = require(path.resolve(__dirname+'/../models/js/inventory.model.js')).Inventory;
var colors = require('colors');

/**
* Fetches the inventory of the given trainer
* @param String username , unique ID
* @param Function callback(error, inventory)
* @return callback(Error error, Inventory inventory)
*/
function findInventory(username, callback) {
  Inventory.findOne(
    {'owner':username},
    function(error, inventory) {
      if (error) console.log(('[!] Error fetching inventory \n'+error).red);
      else if (inventory) console.log('[i] Found inventory for '+username);
      return callback(error, inventory);
    }
  );
}

/**
* Updates the entire inventory of the given trainer
* @param String username, unique ID
* @param Item[] {items} , Array of Inventory.Item child objects
* @param Function callback(error, inventory)
* @return callback(Error error, Inventory inventory)
*/
function updateInventory(username, items, callback) {
  Inventory.findOneAndUpdate(
    {'owner':username},
    {'items':items},
    {runValidators:true, new:true},
    function(error, newInventory) {
      if (error) console.log(('[!] Error updating inventory. \n'+error).red);
      else console.log('[i] Updated inventory for : '+username);
      return callback(error, newInventory);
    }
  );
}

/**
* Updates a single item from the given trainer's inventory
* @param String username , unique ID
* @param Item {item} , Inventory.Item child objecet
* @param Function callback(error, inventory)
* @return callback(Error error, Inventory inventory)
*/
function updateItem(username, item, callback) {
  Inventory.findOneAndUpdate(
    {'owner':username, 'items.item_id':item.item_id, 'item.unseen':item.unseem},
    {'$set':item},
    {runValidators:true, new:true},
    function(error, newInventory) {
      if (error) console.log(('[!] Error updating Inventory item. \n'+error).red);
      else console.log('[i] Updated inventory item for : '+username+', item : '+item.item_id);
      callback(error, newInventory);
    }
  );
}

/**
* Creates a new inventory for the given trainer
* @param String username , unique identifier
* @param Item[] {items} , array of Inventory.Item child objects
* @param Function callback(error, inventory)
* @return callback(Error error, Inventory inventory)
*/
function createInventory(username, items, callback) {
  Inventory.create(
    {'owner':username, 'items':items},
    function(error, newInventory) {
      if (error) console.log(('[!] Error creating inventory. \n'+error).red);
      else console.log('[i] Created inventory for : '+username);
      callback(error, newInventory);
    }
  );
}

// Exports
module.exports = {
  findInventory : findInventory,
  updateInventory : updateInventory,
  updateItem : updateItem,
  createInventory : createInventory
}
