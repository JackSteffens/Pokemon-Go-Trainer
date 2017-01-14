// Candy model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Child candy
var Candy = new Schema({
  family_id: {type:Number, required:true},
  candy:{type:Number, required:true}
});

var CandiesSchema = new Schema({
  owner: {type:String, required:true},
  candies: [Candy]
});

Candies = mongoose.model('candies', CandiesSchema);

module.exports.Candies = Candies;
module.exports.Schema = Candies;
