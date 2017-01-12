// Badge model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Child badge
var Badge = new Schema({
  badge_type: {type:Number, required:true},   // Badge id
  rank: {type:Number, required:true},         // Rank
  start_value: {type:Number, required:true},  // Start exp by rank
  end_value: {type:Number, required: true},   // End exp by rank
  current_value: {type:Number, required:true} // Achieved exp
});

var BadgesSchema = new Schema({
  owner: {type:String, required:true, unique:true},  // Trainer's in game username
  badges: [Badge] // Array of Badge objects
});

Badges = mongoose.model('badges', BadgesSchema);

module.exports.Badges = Badges;
module.exports.Schema = BadgesSchema;
