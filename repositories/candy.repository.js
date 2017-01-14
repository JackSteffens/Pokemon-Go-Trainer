// Model
var path = require('path');
var Candy = require(path.resolve(__dirname+'/../models/js/candy.model.js')).Candies;
var colors = require('colors');

/**
* Find Candies by Trainer username
* @param String username, unique identifier
* @param Function callback(error, candies)
* @return callback(Error error, Candies candies) , return function
*/
function findCandies(username, callback) {
  Candy.findOne(
    {'owner':username},
    function(error, candies) {
      if (error) console.log(('[!] Error fetching candies \n'+error).red);
      else if (candies) console.log('[i] Found candies for : '+username);
      return callback(error, candies);
  });
}


/**
* Update all Candies from a specific Trainer
* @param String username, unique identifier
* @param Candy[] {candies} , array of Candies.Candy child objects
* @param Function callback(error, candies)
* @return callback(Error error, Candies candies) , return function
*/
function updateCandies(username, candies, callback) {
  Candy.findOneAndUpdate(
    {'owner':username},
    {'candies':candies},
    {runValidators:true, new:true},
    function(error, newCandies) {
      if (error) console.log(('[!] Error updating candies \n'+error).red);
      else if (newCandies) console.log('[i] Updated candies for : '+username);
      return callback(error, newCandies);
    }
  );
}

/**
* Update a single Candy from a specific Trainer
* @param String username, unique identifier
* @param Candy {candy} , Candies.Candy child object
* @param Function callback(error, candies)
* @return callback(Error error, Candies candies) , return function
*/
function updateCandy(username, candy, callback) {
  Candy.findOneAndUpdate(
    {'owner':username, 'candies.family_id':candy.family_id},
    {'$set':candy},
    {runValidators:true, new:true},
    function(error, newCandies) {
      if (error) console.log(('[!] Error updating candy \n'+error).red);
      else if (newCandies) console.log('[i] Updated candy for : '+username+', ID : '+candy.family_id);
      return callback(error, newCandies);
    }
  );
}

/**
* Create new Candies for a Trainer
* @param String username, unique identifier
* @param Candy[] candies , array of Candies.Candy child objects
* @param Function callback(error, candies, candies)
* @return callback(Error error, Candies candies) , return function
*/
function createCandies(username, candies, callback) {
  Candy.create(
    {'owner':username, 'candies':candies},
    function(error, newCandies) {
      if (error) console.log(('[!] Error creating candies \n'+error).red);
      else if (newCandies) console.log('[i] Created candies for : '+username);
      return callback(error, newCandies);
    }
  );
}

module.exports = {
  findCandies : findCandies,
  updateCandies : updateCandies,
  updateCandy : updateCandy,
  createCandies : createCandies
}
