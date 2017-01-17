// Dependencies
var path = require('path');                 // Path resolver
var config = require('../config.js');       // Configuration
var CustomAPI = require('../CustomAPI.js'); // Niantic API
var request = require('request');           // HTTP requests
var protobuf = require('protobufjs');       // Decoding responses using .proto
var Long = require('long')                  // Long for date timestamps
var colors = require('colors');             // Console collors
var websocket = require('../utils/websocket.js'); // Websocket

// Services
var trainerService = require(path.resolve(__dirname+'/../services/trainer.service.js'));

// Configuration
request = request.defaults({jar: request.jar()});

/**
* Fetches a route from the Google Maps API. Start and End points with
* mid-section traversing points.
* @param Float oLat , origin latitude
* @param Float oLng , origin longitude
* @param Float dLat , destination latitude
* @param Float dLng , destination longitude
* @param String trvlMode , Maps API travel mode : BICYCLING, DRIVING, TRANSIT, WALKING
* @param Function callback(error, path)
* @return callback(Error error, Path path)
*/
function fetchPath(oLat, oLng, dLat, dLng, trvlMode, callback) {
    if (oLat && oLng && dLat && dLng) {
      var base = "https://maps.googleapis.com/maps/api/directions/json"
      var url = base+"?origin="+oLat+","+oLng+"&destination="+dLat+","+dLng+"&mode="+trvlMode+"&key="+config.MAPS_API_KEY;
      request.get(url, function(error, response, body){
        if (error) callback(error);
        else if (body) console.log('[i] Fetched Google Maps route');
        callback(error, body);
      });
    } else {
      callback("Missing location details (originlat, originlng, destlat, destlng)")
    }
}

module.exports = {
  fetchPath : fetchPath,
}
