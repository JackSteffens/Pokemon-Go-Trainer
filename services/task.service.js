// Dependencies
var path = require('path');                 // Path resolver
var config = require('../config.js');       // Configuration
var CustomAPI = require('../CustomAPI.js'); // Niantic API
var protobuf = require('protobufjs');       // Decoding responses using .proto
var Long = require('long')                  // Long for date timestamps
var colors = require('colors');             // Console collors
var websocket = require('../utils/websocket.js'); // Websocket
var ByteBuffer = require('bytebuffer');

// Services
var trainerService = require(path.resolve(__dirname+'/../services/trainer.service.js'));

/**
* Start point of the path loop cycle.
* @param String username , trainer that's being put in the loop.
* @param Function callback(error, message)
* @return callback(Error error, String message) , message confirming that the loop has started
*/
function traversePath(username, callback) {
  trainerService.getTrainer(username, function(error, trainer) {
    if (error) return callback(error);
    else if (trainer) {
      var destination = trainer.destination;
      var currentLocation = trainer.location;
      if (!destination || !currentLocation) return callback("Trainer "+username+" doesn't have destination or current location.");
      else if (trainer.destination.enabled) return callback("Trainer "+username+" is already traversing a path.");
      var newDestination = trainer.destination;
      destination.enabled = true;
      trainerService.updateDestinationObject(trainer.username, newDestination, function(error, newTrainer) {
        if (error) {console.log(error); return callback(error);}
        trainer.destination.enabled = true;
        startPathLoop(trainer);
        return callback(null, "Starting path sequence");
      });
    }
    return callback('No trainer found : '+username);
  });
}

/**
* Starts a loop cycle based on the Destination object stored inside the
* Trainer object. Calculates distance based on time it takes to do a cycle,
* the previous location update (time) and on the set speed.
* @param Trainer {trainer}
*/
function startPathLoop(trainer) {
  var LOOP_DELAY = 450; // ms
  // Set variables
  if (trainer.destination && trainer.destination.enabled) {
    var currPos = {
      lat: trainer.location.latitude,
      lng: trainer.location.longitude
    };
    var waypointsIndex = trainer.destination.current_waypoint;
    var destPos = {
      lat: trainer.destination.waypoints[waypointsIndex].location.lat,
      lng:trainer.destination.waypoints[waypointsIndex].location.lng
    };
    var traverseSpeed = trainer.destination.speed;
    var previousTimestamp = trainer.location.last_timestamp;
    var nextPos = calculatePosition(currPos, destPos, traverseSpeed, previousTimestamp);
    if (currPos.lat == nextPos.lat && currPos.lng == nextPos.lng) {
      var nextWaypointIndex = waypointsIndex+1;
      if (nextWaypointIndex >= trainer.destination.waypoints.length) {
        console.log(('[i] Final destination reached with trainer : '+trainer.username).green);
        trainerService.updateDestinationObject(trainer.username, null, function(error, newTrainer) {
          if (error) console.log(error.red);
          return; // Done. Stop traversing.
        });
      } else {
        // Go to next waypoint
        console.log('[i] Waypoint section reached');
        var newDestination = trainer.destination;
        newDestination.current_waypoint = nextWaypointIndex;
        trainerService.updateDestinationObject(trainer.username, newDestination, function(error, newDestination) {
          if (error) console.log(error);
          else {
            setTimeout(function() {
              trainerService.getTrainer(trainer.username, function(error, latestTrainer) {
                if (error) console.log('[!] Trainer could not be fetched from the database'.red);
                startPathLoop(latestTrainer);
              });
            }, LOOP_DELAY);
          }
          return;
        });
      }
    } else {
      trainerService.updateLocation(trainer.username, {latitude:nextPos.lat, longitude:nextPos.lng, accuracy:0}, function(error, newTrainer) {
        if (error) console.log(error);
        else {
          setTimeout(function() {
            trainerService.getTrainer(newTrainer.username, function(error, latestTrainer) {
              if (error) console.log('[!] Trainer could not be fetched from the database'.red);
              startPathLoop(latestTrainer);
            });
          }, LOOP_DELAY);
        }
      });
    }
  } else {
    console.log(('[#] Path traversing stopped for player : '+trainer.username).yellow);
    // timeout.stop();
  }
}

/**
* Calculate the next location point based on current position, desired position,
* speed and time since last step. Making use of the Haversine formula.
* Credits to http://www.movable-type.co.uk/scripts/latlong.html
* @param Object {currPos} , contains coordinates as {lat, lng}
* @param Object {destPos} , contains coordinates as {lat, lng}
* @param int speed in km/h
* @param int time in miliseconds
* @return Object {obj} , contains coordinates as {lat, lng}
*/
function calculatePosition(currPos, destPos, speed, time) {
  // Lets assume someone starts with a wait time of a minute, you char will fly on its first step.
  var MAX_WAIT_TIME = 10000; // ms.
  var deltaTime = (new Date().getTime() - time); // miliseconds
  var R = 6371e3; // meters
  var φ1 = currPos.lat * (Math.PI / 180);
  var φ2 = destPos.lat * (Math.PI / 180);
  var Δφ = (destPos.lat-currPos.lat) * (Math.PI / 180);
  var Δλ = (destPos.lng-currPos.lng) * (Math.PI / 180);

  var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;

  deltaTime = deltaTime > MAX_WAIT_TIME ? MAX_WAIT_TIME : deltaTime;
  var allowedDistance = (deltaTime / 1000) * (speed / 3.6); // seconds * m/s

  if (d > allowedDistance) { // final destination might already be in reach
    var β = Math.atan2(
      (Math.cos(φ2) * Math.sin(Δλ)),
      ( (Math.cos(φ1) * Math.sin(φ2)) - (Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)) )
    );

    var Ad = allowedDistance/R;
    var λ1 = currPos.lng * (Math.PI / 180);
    var φ3 = Math.asin(
      Math.sin(φ1) * Math.cos(Ad) + Math.cos(φ1) * Math.sin(Ad) * Math.cos(β)
    );
    var λ3 = (λ1 + Math.atan2(
      Math.sin(β) * Math.sin(Ad) * Math.cos(λ1),
      Math.cos(Ad) - Math.sin(λ1) * Math.sin(φ3)
    )) / (Math.PI / 180);
    φ3 = φ3 / (Math.PI / 180); // φ3 is used in λ3, therefor this is done at the end.

    return {
      lat: φ3,
      lng: λ3
    };
  } else {
    return destPos;
  }
}


/**
* Scans the surrounding area for pokemons, gyms and poke stops
* ***  ***  *** *** ***  FIXME *** *** *** *** ***
* Currently doesn't work because of the Unknown6 protobuf message.
* This is now a required field for API calls and requires an hashing algorithm
* which has been discovered but is not made publicly available.
* See: https://talk.pogodev.org/
* @param String username , unique identifier
* @param Function callback(error, data)
* @return callback(Error error, Object data) , data includes array wild_pokemon[], array forts[], int number_of_forts
*/
function scan(username, callback) {
  trainerService.getAvailableTrainers(username, function(error, trainer) {
    if (error) console.log('[!] Trainer could not be fetched from the database'.red);
    else if (trainer) {
      var message = new CustomAPI.RequestMessage.PlayerUpdateMessage(
        parseFloat(trainer.location.latitude),
        parseFloat(trainer.location.longitude)
      );
      message = message.encode().toBuffer();
      // FIXME While this request is valid but it always returns a message with empty values
      var requestType = new CustomAPI.RequestNetwork.Request(1, message);
      CustomAPI.api_req(trainer, requestType, function(error, data) {
        if (error) {
          console.log(('[!] Error scanning map data'+error).red);
          return callback(error);
        } else if (data) {
          console.log('[i] Scan data : '.cyan)
          console.log(data);
        }
        return callback(error, data);
      }, CustomAPI.ResponseNetwork.PlayerUpdateResponse);
    } else return callback('No trainer found');
  });
}

module.exports = {
  traversePath : traversePath,
  calculatePosition : calculatePosition,
  scan : scan
}
