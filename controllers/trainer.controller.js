// Dependencies
var config = require("../config.js");
var trainerService = require('../services/trainer.service.js');

/**
* Get all known trainers from database. If a username is given then only return
* that specific trainer oject.
* @param req , containing optional String req.query.username
* @param res
* @return Trainer[] trainers , array of Trainer objects
*/
function getTrainer(req, res) {
  var username = req.query.username || null;
  trainerService.getTrainer(username, function(error, trainers) {
    if (error) {
      res.status('400');
      return res.send(err);
    }
    return res.send(trainers);
  })
}

/**
* Get logged in trainers from database. If a username is given then only return
* that specific trainer object.
* @param req , containing optional String req.query.username
* @param res
* @return Trainer[] trainers , array of Trainer objects
*/
function getAvailableTrainers(req, res) {
  var username = req.query.username || null;
  trainerService.getAvailableTrainers(username, function(error, trainers) {
    if (error) {
      res.status('400');
      return res.send(error);
    } else {
      return res.send(trainers);
    }
  });
}

/**
* Request an API token from the Niantic Server, stores a trainer object
* in the database and adds it to the local trainer array 'availaleUsers'.
* @param String username, req.body.username
* @param String password, req.body.password
* @param String provider, req.body.provider : "ptc" || "google"
* @return {}
*/
function login(req, res) {
  credentials = {
    username : req.body.username,
    password : req.body.password,
    provider : req.body.provider,
    latitude : parseFloat(req.body.latitude),
    longitude: parseFloat(req.body.longitude),
    altitude : parseFloat(req.body.altitude)
  }

  if (credentials.username == undefined || credentials.password == undefined) {
    res.status('400');
    res.send('Both a username and password are required');
  }

  if (credentials.provider === 'ptc') {
    console.log('[i] Logging in as : '+credentials.username+' on Pokémon Trading club');
    trainerService.pokemonClub(credentials, function(err, trainerObj) {
      if (err) {
        console.log("[!] Error : "+err);
        res.status('400');
        return res.send(err);
      }
      return res.send(trainerObj);
    });
  } else if (credentials.provider === 'google') {
    console.log('[i] Logging in as : '+credentials.username+' on Google');
    trainerService.googleOAuth(credentials, function (err, trainerObj) {
      if (err) {
        console.log("[!] Error : "+err);
        res.status('400');
        try {
          return res.send(err);
        } catch (e) {
          return res.send("Error logging into Google services");
        }
      }
      return res.send(trainerObj);
    })
  } else {
    res.status('400');
    return res.send('[!] No valid provider provided');
  }
};

/**
* Deletes the API token from the database and removes the trainer object
* from the 'available' array.
* @return {}
*/
function logout(req, res) {
  var username = req.query.username;
  if (!username) {
    console.log('[#] No username supplied.');
    res.status('400');
    return res.send('No username supplied');
  }

  trainerService.logout(username, function(error, trainer) {
    if (error) {
      res.status('400');
      return res.send(error);
    } else if (trainer) {
      return res.send(trainer);
    } else {
      res.status('400');
      res.send(new Error('No trainer found'))
    }
  });
}

/**
* Get trainer profile from local database
* @param String username
* @return {Medals, Levels, something}
*/
function getProfile(req, res) {
  var username = req.query.username || null;
  if (!username) {
    res.status('400');
    return res.send(new Error('No username supplied'));
  }
  trainerService.getProfile(username, function(error, badges) {
    if (error) {
      res.status('400');
      return res.send(error);
    } else if (badges) {
      return res.send(badges);
    } else {
      res.status('400');
      res.send(new Error('No badges found'))
    }
  });
}

/**
* GET : Get trainer inventory
* @param : username (String) (in-game username)
* @return {Inventory}
*/
function getInventory(req, res) {
  console.log('[!] Requesting inventory for user : '+req.query.username);
};


/**
* Get pokemon by trainer username and pokemon ID ??
* @return {Pokemon}
*/
function getPokemon(req, res) {
 // TODO Implement
}

function getPokedex() {

}

function getStatistics() {

}

function getCandies() {

}

module.exports = {
  getTrainer : getTrainer,
  login : login,
  logout : logout,
  getInventory : getInventory,
  getProfile : getProfile,
  getAvailableTrainers : getAvailableTrainers,
  getPokemon : getPokemon,
  getPokedex : getPokedex,
  getStatistics : getStatistics,
  getCandies : getCandies
}
