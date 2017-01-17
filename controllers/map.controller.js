// Dependencies
var config = require('../config.js');
var mapService = require(__dirname+'/../services/map.service.js');
var taskService = require(__dirname+'/../services/task.service.js');
var request = require('request');
var path = require('path');
var S2 = require('s2-geometry').S2;


function getScanData(req, res) {
    res.sendFile(path.resolve(__dirname+'/../models/json/scanned_pokemon.json'));
}

function getScanDataExternal(req, res) {
  request.get('http://localhost:5000/raw_data', function(err, response, body){
    if (err) {res.status('404'); res.send('Could not connect to the scanner'); return;}
    res.json(body);
  });
}

/**
* TODO Move this to a 'task controller'
* Calls the loop cycle task for a Trainer object
* @param String req.query.username , unique identifier for a Trainer
* @param res return call.
* @return Don't return anything or it will cancel the loop cycle thread!
*/
function traversePath(req, res) {
  var username = req.query.username || null;
  if (!username) {
    res.status('400');
    return res.send('No username supplied');
  }
  taskService.traversePath(username, function(error, message) {
    if (error) {
      console.log(error)
      res.status('400');
      return res.send(error);
    } else if (message) {
      console.log(message.cyan);
    }
  });
}

/**
* GET : Request path from Google Maps API
* Return : [DirectionsResult] object containing a path using coordinates
*/
function getPath(req, res) {
  var oLat = parseFloat(req.query.originlat),
      oLng = parseFloat(req.query.originlng),
      dLat = parseFloat(req.query.destlat),
      dLng = parseFloat(req.query.destlng),
      trvlMode = req.query.trvlMode || "BICYCLING";
  if (!oLat || !oLng || !dLat || !dLng) {
    res.status('400');
    return res.send('Please supply the right coordinates');
  }

  mapService.fetchPath(oLat, oLng, dLat, dLng, trvlMode, function(error, route) {
    if (error) {
      res.status('400');
      return res.send(error);
    } else if (route) {
      return res.json(route);
    } else {
      res.status('400')
      return res.send('No route received');
    }
  });
}

function convertS2ToCoord(req, res) {
  if (req.query.s2)
    return res.send(S2.idToLatLng(req.query.s2));
  else return res.send();
}

/**
* 
*
*/
function getDistance(req, res) {
  var currPos = {
    lat: req.query.lat1,
    lng: req.query.lng1
  };
  var destPos = {
    lat: req.query.lat2,
    lng: req.query.lng2
  };
  return res.send(taskService.calculatePosition(currPos, destPos, 5, 0));
}

// Exports
module.exports = {
  getScanData : getScanData,
  getScanDataExternal : getScanDataExternal,
  getPath : getPath,
  convertS2ToCoord : convertS2ToCoord,
  traversePath : traversePath,
  getDistance : getDistance
}
