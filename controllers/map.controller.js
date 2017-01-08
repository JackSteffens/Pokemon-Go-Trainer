// Dependencies
var config = require(__dirname+'/../config.js');
var request = require('request');
var path = require('path');


exports.getScanData = function(req, res) {
    res.sendFile(path.resolve(__dirname+'/../models/json/scanned_pokemon.json'));
};

exports.getScanDataExternal = function(req, res) {
  request.get('http://localhost:5000/raw_data', function(err, response, body){
    if (err) {res.status('404'); res.send('Could not connect to the scanner'); return;}
    res.json(body);
  })
};

/**
* GET : Request path from Google Maps API
* Return : [DirectionsResult] object containing a path using coordinates
*/
exports.getPath = function(req, res) {
var oLat = req.query.originlat,
    oLng = req.query.originlng,
    dLat = req.query.destlat,
    dLng = req.query.destlng,
    trvlMode = req.query.mode;

    if (!trvlMode || trvlMode == "") {
      trvlMode = "bicycling";
    }

  if (oLat && oLng && dLat && dLng) {
    var base = "https://maps.googleapis.com/maps/api/directions/json"
    var url = base+"?origin="+oLat+","+oLng+"&destination="+dLat+","+dLng+"&key="+config.MAPS_API_KEY;
    if (trvlMode) {
      url = url+"&mode="+trvlMode;
    }
    console.log(url);
    request.get(url, function(err, response, body){
      res.json(body);
    });
  } else {
    res.status(400);
    res.send("Please supply both latitude and longitude values for both origin and destination [originlat, originlng, destlat, destlng]")
  }
}
