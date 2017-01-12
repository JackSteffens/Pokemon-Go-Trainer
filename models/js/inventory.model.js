// Inventory model. Includes items.
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Inventory child object
var Item = new Schema({
  item_id: {type:Number, required:true, unique:true, index: {unique: true}},
  count: {type:Number, required:true},
  unseen: {type:Boolean, required:true}
});

var InventorySchema = new Schema({
  owner:{type:String, required:true, unique:true},
  items: [Item]
});

Inventory = mongoose.model('inventory', InventorySchema);

module.exports.Inventory = Inventory;
module.exports.Schema = InventorySchema;
