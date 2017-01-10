// Model
var path = require('path')
var Trainer = require(path.resolve(__dirname+'/../models/js/trainer.model.js')).Trainer;

module.exports = {
  /**
  * Find a trainer by username
  * @param String username
  * @return Object<Trainer> trainer
  */
  findTrainer : function(username, callback) {
    Trainer.findOne({username: username}, function(error, trainer) {
      if (error) {
        console.log('[!] Error fetching trainer')
        console.log(error);
        callback(error, null);
        return;
      }
      if (trainer) {
        console.log('[i] Found trainer : '+trainer.username);
      } else {
        console.log("[i] No trainer found : "+username);
      }
      callback(null, trainer);
      return;
    });
  },

  /**
  * Fetch logged in trainers (indicated by having an API token)
  * @return Array<Trainer> trainers
  */
  findOnlineTrainers : function(username, callback) {
    if (username) {
      console.log('TODO Implement username filter. Returning all instead.')
    }
    Trainer.find({'login.accessToken': {$ne : null}}, function(error, trainers) {
      callback(trainers);
    });
  },

 /**
 *
 */
  updateTrainer : function(trainer, callback) {
    Trainer.findOneAndUpdate(
      {username:trainer.username},       // Where username = username
      trainer,
      // Options
      {
        runValidators:true,
        new:true
      },

      // Callback
      function(error, newTrainer) {
        if (error) {
          console.log('[!] Error updating trainer')
          console.log(error);
          callback(error, null);
          return;
        }
        console.log('[i] Updated existing trainer : '+newTrainer.username);
        callback(null, newTrainer);
        return;
      });
  },

  createTrainer : function(trainer, callback) {
    Trainer.create(
      trainer,
      function(error, newTrainer) {
        if (error) {
          console.log('[!] Error creating trainer')
          console.log(error);
          callback(error, null);
          return;}
        console.log('[i] Created new trainer : '+newTrainer.username);
        callback(null, newTrainer);
      }
    );
  }

}
