// Model
var path = require('path')
var Trainer = require(path.resolve(__dirname+'/../models/js/trainer.model.js')).Trainer;
var colors = require('colors');

/**
* Find a trainer by username or all trainers
* @param String username
* @param Function callback(error, trainer)
* @return callback(Error error, Trainer trainer)
*/
function getTrainer(username, callback) {
  if (username) {
    Trainer.findOne(
      {'username':username},
      function(error, trainer) {
        if (error) console.log(('[!] Error fetching trainer \n'+error).red);
        else if (trainer) console.log('[i] Found trainer : '+username);
        return callback(error, trainer);
      }
    );
  } else {
    Trainer.find({},
      function(error, trainers) {
        if (error) console.log(('[!] Error fetching trainers \n'+error).red);
        else if (trainers) console.log('[i] Found trainers : '+trainers.length);
        return callback(error, trainers);
      }
    );
  }
}

/**
* Fetch logged in trainers (indicated by having an API token)
* @param String username
* @param Function callback(error, trainers)
* @return callback(Error error, Trainer[] trainers) , array of Trainer objects
*/
function getOnlineTrainers(username, callback) {
  if (username) {
    Trainer.findOne(
      {'login.accessToken': {$ne : null}, 'username':username},
      function(error, trainer) {
        if (error) console.log(('[!] Error fetching single online trainer \n'+error).red);
        else if (trainer) console.log('[i] Found online trainer : '+username);
        return callback(error, trainer);
      }
    );
  } else {
    Trainer.find(
      {'login.accessToken': {$ne : null}},
      function(error, trainers) {
        if (error) console.log(('[!] Error fetching online trainers \n'+error).red);
        else if (trainers) console.log('[i] Found online trainers : '+trainers.length);
        return callback(error, trainers);
      }
    );
  }
}

/**
* Update existing trainer object in the local database with a new Trainer object
* @param Trainer trainer. New database entry. Trainer.username as unique ID
* @param Function callback(error, trainer)
* @return callback(Error error, Trainer trainer) , return function
*/
function updateTrainer(trainer, callback) {
  Trainer.findOneAndUpdate(
    {username:trainer.username},
    trainer,
    {runValidators:true, new:true},
    function(error, newTrainer) {
      if (error) console.log(('[!] Error updating trainer \n'+error).red)
      else console.log('[i] Updated existing trainer : '+newTrainer.username);
      return callback(error, newTrainer);
    });
}

/**
* Update the trainer's Statistics
* @param String username , unique indentifier
* @param Statistics {statistics} , Trainer.Statistics child object
* @param Function callback(error, newTrainer)
* @return callback(Error error, Trainer newTrainer)
*/
function updateStatistics(username, statistics, callback) {
  Trainer.findOneAndUpdate(
    {'username':username},
    {'statistics':statistics},
    {runValidators:true, new:true},
    function(error, newTrainer) {
      if (error) console.log(('[!] Error updating trainer stats \n'+error).red)
      else if (newTrainer) console.log('[i] Updated existing trainer stats : '+newTrainer.username);
      return callback(error, newTrainer);
    }
  );
}

/**
* Update the trainer's location
* @param String username , unique indentifier
* @param Object {location} , containing location.latitude & location.longitude
* @param Function callback(error, newTrainer)
* @param callback(Error error, Trainer newTrainer) callback function
*/
function updateLocation(username, location, callback) {
  Trainer.findOneAndUpdate(
    {'username':username},
    {'location':{
        'latitude':location.latitude,
        'longitude':location.longitude,
        'accuracy':location.accuracy || 0,
        'last_timestamp': new Date().getTime()
    }},
    {runValidators:true, new:true},
    function(error, newTrainer) {
      if (error) console.log(('[!] Error udating trainer location \n'+error).red)
      else if (newTrainer) console.log('[i] Updated location for trainer : '+username)
      return callback(error, newTrainer);
    }
  )
}

/**
* Update a trainer destination path object
* @param String username , unique identifier
* @param Destination {destination}
* @param Function callback(error, newTrainer)
* @return function(Error error, Trainer newTrainer) , callback function
*/
function updateDestination(username, destination, callback) {
  Trainer.findOneAndUpdate(
    {'username':username},
    {'destination':destination},
    {runValidators:true, new:true},
    function(error, newTrainer) {
      if (error) console.log(('[!] Error updating player destination \n'+error).red);
      else if (newTrainer) console.log('[i] Updated destination for trainer : '+newTrainer.username);
      callback(error, newTrainer);
    }
  )
}

/**
* Create new trainer object in the local database
* @param Trainer trainer
* @param Function callback(error, trainer)
* @return callback(Error error, Trainer trainer) , return function
*/
function createTrainer(trainer, callback) {
  Trainer.create(trainer,
    function(error, newTrainer) {
      if (error) console.log(('[!] Error creating trainer \n'+error).red);
      else console.log('[i] Created new trainer : '+newTrainer.username);
      return callback(error, newTrainer);
    }
  );
}

module.exports = {
  getTrainer : getTrainer,
  getOnlineTrainers : getOnlineTrainers,
  updateTrainer : updateTrainer,
  updateStatistics : updateStatistics,
  updateLocation : updateLocation,
  updateDestination : updateDestination,
  createTrainer : createTrainer
}
