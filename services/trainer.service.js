// Dependencies
var path = require('path');
var config = require('../config.js');
var CustomAPI = require('../CustomAPI.js');
var request = require('request');         // HTTP requests
var protobuf = require('protobufjs');     // Decoding responses using .proto
var GoogleOAuth = require('gpsoauthnode');// Google authentication
var Long = require('long')                // Long for date timestamps
var trainerRepo = require(path.resolve(__dirname+'/../repositories/trainer.repository.js'))
var badgeRepo = require(path.resolve(__dirname+'/../repositories/badge.repository.js'))

// Google oAuth
var google = new GoogleOAuth();
request = request.defaults({jar: request.jar()}); // For some reason this shit is needed to log in.

/**
* Authenticate on the Niantic servers using the identification tokens
* from the handshake request and character credentials given by the user.
* @param String err, errors from the request function
* @param String response, response from the request function
* @param Object body, body from the request function
* @param Object credentials, contains data equired for authentication
* @param Function callback, post login & error handling function
*/
function ptcHandshakeCallback(err, response, body, credentials, callback) {
  var data;

  if (err) {
    return callback(err);
  }

  try {
    // FIXME This fucks up after logging in for a second time.
    data = JSON.parse(body);
  }catch(err){
    if (!data) {
      return callback(err);
    } else {
      return callback(data);
    }
  }
  console.log('[i] First request successful.');
  options = {
    url: config.LOGIN_URL,
    form: {
      'lt': data.lt,
      'execution': data.execution,
      '_eventId': 'submit',
      'username': credentials.username,
      'password': credentials.password
    },
    headers: config.REQ_HEADERS
  };

  // SECOND REQUEST //
  request.post(options, function(err, response, body) {
    if(err) {return callback(err);}
    if (body) {
      var parsedBody = JSON.parse(body);
      if (parsedBody.errors && parsedBody.errors.length !== 0) {
        return callback('Error logging in: ' + parsedBody.errors[0], null);
      }
    }
    console.log('[i] Second request successful');
    var ticket = response.headers['location'].split('ticket=')[1];
    if (!ticket) {return callback('No ticket found!');}
    console.log('[i] ticket : '+ticket);

    var authObjects = {
      ticket : ticket,
      token : undefined,
      endpoint : undefined
    }
    ptcLoginCallback(authObjects, credentials, callback)
  });
}

/**
* Does a followup request to obtain the API token from Niantic's servers.
* @param Object authObjects, contains the ticket
* @param Object credentials, contains data equired for authentication
* @param Function callback, post login & error handling function
*/
function ptcLoginCallback(authObjects, credentials, callback) {
  options = {
    url: config.LOGIN_OAUTH,
    form: {
      'client_id': config.CLIENT_ID,
      'redirect_uri': 'https://www.nianticlabs.com/pokemongo/error',
      'client_secret': config.CLIENT_SECRET,
      'grant_type': 'refresh_token',
      'code': authObjects.ticket
    },
    headers: config.REQ_HEADERS
  };
  // THIRD REQUEST //
  request.post(options, function(err, response, body) {
    if(err) {return callback(err);}

    var token;
    token = body.split('token=')[1];
    token = token.split('&')[0];
    if (!token) {
      return callback('Login failed. No token recieved!');
    }
    authObjects.token = token;
    console.log('[i] Session token: ' + token);
    postTokenCallback(authObjects, credentials, callback);
  });
}

/**
* Get the requests API endpoint for a specific account and update Trainer info
* such as profile, inventory, badges and pokemon team.
* @param Object authObjects, contains the ticket & token
* @param Object credentials, contains data equired for authentication
* @param Function callback, post login & error handling function
*/
function postTokenCallback(authObjects, credentials, callback) {
  var trainerObj = {
    login: {
      provider: (credentials.provider).toString(),
      username: credentials.username,
      ticket: authObjects.ticket,
      accessToken: authObjects.token
    },
    location: {
      latitude: parseFloat(credentials.latitude),
      longitude: parseFloat(credentials.longitude),
      altitude: parseFloat(credentials.altitude)
    }
  }
  getApiEndpoint(trainerObj, function(error, trainerObj) {
    if (error) {return callback(error);}

    getTrainerData(trainerObj, function(error, statistics) {
      if (error) {callback(error); return;}
      trainerObj = parseTrainerData(trainerObj, statistics);
      console.log("[i] Authentication process complete.");

      getTrainerProfile(trainerObj, function(error, badges) {
        if (badges)
          storeTrainerProfile(trainerObj, badges);
        else
          console.log('[!] No badges returned from Niantic server')
      }); // getTrainerProfile

      // getTrainerInventory()
      // getTrainerPokemon()

      storeTrainerData(trainerObj, function(error, newTrainerObj) {
        callback(error, newTrainerObj);
      });
    }); // getTrainerData
  }); // getApiEndpoint
}

/**
* Parses the Niantic server response statistics into a Trainer object that
* our local database and application understands.
* @param Trainer {trainerObj}
* @param {statistics}
* @return Trainer {trainerObj}
*/
function parseTrainerData(trainerObj, statistics) {
  trainerObj.creation_timestamp = new Long(
    statistics.creation_timestamp_ms.low,
    statistics.creation_timestamp_ms.high,
    statistics.creation_timestamp_ms.unsigned);
  trainerObj.username = statistics.username;
  trainerObj.currency = {
    pokecoin : statistics.currencies[0].amount,
    stardust : statistics.currencies[1].amount
  }
  trainerObj.max_pokemon_storage = statistics.max_pokemon_storage;
  trainerObj.max_item_storage = statistics.max_item_storage;
  trainerObj.team = statistics.team;
  trainerObj.avatar = {
    skin  : statistics.avatar.skin,
    hair  : statistics.avatar.hair,
    shirt : statistics.avatar.shirt,
    pants : statistics.avatar.pants,
    hat   : statistics.avatar.hat,
    shoes : statistics.avatar.shoes,
    gender: statistics.avatar.gender,
    eyes  : statistics.avatar.eyes,
    backpack: statistics.avatar.backpack
  };
  trainerObj.daily_bonus = {
    next_collected_timestamp : new Long(
      statistics.daily_bonus.next_collected_timestamp_ms.low,
      statistics.daily_bonus.next_collected_timestamp_ms.high,
      statistics.daily_bonus.next_collected_timestamp_ms.unsigned),
    next_defender_bonus_collect_timestamp : new Long(
      statistics.daily_bonus.next_defender_bonus_collect_timestamp_ms.low,
      statistics.daily_bonus.next_defender_bonus_collect_timestamp_ms.high,
      statistics.daily_bonus.next_defender_bonus_collect_timestamp_ms.unsigned)
  };

  return trainerObj;
}

/**
* Searches for existing badges based on Trainer's username and decides to
* create a new database entry or update an existing one.
* @param Trainer trainerObj, containing the old trainer statistics but with new authorization values
* @param {badges}, containing updated trainer badges
*/
function storeTrainerProfile(trainerObj, badges) {
  badgeRepo.findByUsername(trainerObj.username, function(error, oldBadges) {
    if (!error) {
      if (oldBadges) // updateBadges(username, badges);
        badgeRepo.updateBadges(trainerObj.username, badges, function(error, newBadges) {
          console.log('[i] Existing badges updated. Check database!');
        });
      else
        badgeRepo.createBadges(trainerObj.username, badges, function(error, newBadges) {
        console.log('[i] New badges created. Check database!');
      });
    }
  });
}

/**
* Searches for an existing trainer and decides to create a new database entry
* or update an existing one.
* @param Trainer trainerObj, containing the old trainer statistics but with new authorization values
* @param {statistics}, containing new trainer statistics
* @param callback(error, obj) return function
* @return callback(Error error, Trainer trainerObj)
*/
function storeTrainerData(trainerObj, callback) {
  trainerRepo.findTrainer(trainerObj.username, function(error, oldTrainer) {
    if (error) {
      return callback(error);
    } else if (oldTrainer) {
      console.log("[!] Trainer exists. Updating database")
      return updateTrainer(trainerObj, callback);
    } else {
      console.log("[!] New trainer. Storing in database")
      return createTrainer(trainerObj, callback);
    }
  });
}

/**
* Fetches a Trainer's badges from the Niantic servers and stores them locally.
* @param Trainer {trainerObj} , required for authentication.
* @param callback(error, obj) , return function.
* @return callback(Error error, Badges badgesObj)
*/
function getTrainerProfile(trainerObj, callback) {
  var requestType = new CustomAPI.RequestNetwork.Request(121);
  CustomAPI.api_req(trainerObj, requestType, function apiCallback(error, badges) {
    if (error) {
      return callback(error);
    } else if (!badges) {
      return callback(new Error('No data received.'));
    } else {
      console.log('[i] Badges fetched!');
      return callback(null, badges);
    }
  }, CustomAPI.ResponseNetwork.GetPlayerProfileResponse);
}

/**
* Fetches Trainer data from the Niantic servers. This request is mandatory for
* obtaining a Trainer's username and therefor has priority over other requests.
* @param Trainer {trainerObj} , required for authentication.
* @param callback(error, obj) , return function.
* @return callback(Error error, Trainer trainerObj)
*/
function getTrainerData(trainerObj, callback) {
  var requestType = new CustomAPI.RequestNetwork.Request(2);
  CustomAPI.api_req(trainerObj, requestType, function(error, statistics) {
    if (error) {
      return callback(error);
    } else if (!statistics) {
      return callback(new Error('No data received.'));
    } else {
      return callback(null, statistics.player_data);
    }
  },CustomAPI.ResponseNetwork.GetPlayerResponse);
}

function updateTrainer(trainerObj, callback) {
  trainerRepo.updateTrainer(trainerObj, function(error, newTrainer) {
    if (error) {callback(error, null); return;}
    callback(null, newTrainer);
  });
}

function createTrainer(trainerObj, callback) {
  trainerRepo.createTrainer(trainerObj, function(error, newTrainer) {
    if (error) {callback(error, null); return;}
    callback(null, newTrainer);
  });
}

/**
* Fetches an endpoint for future requests from the Niantic servers
* @param Object trainerObj
* @param Function callback, post login & error handling function
* @return Function callback, execution
*/
function getApiEndpoint(trainerObj, callback) {
  var req = [
    new CustomAPI.RequestNetwork.Request(2),
    new CustomAPI.RequestNetwork.Request(126),
    new CustomAPI.RequestNetwork.Request(4),
    new CustomAPI.RequestNetwork.Request(129),
    new CustomAPI.RequestNetwork.Request(5)
  ];

  CustomAPI.api_req(trainerObj, req, function (error, response) {
    if (error) {
      return callback(error, null);
    }

    if (response.api_url) {
      var api_endpoint = "https://" + response.api_url + "/rpc";
      trainerObj.login.apiEndpoint = api_endpoint;
      console.log("[!] ApiEndpoint received! : "+api_endpoint);
      return callback(null, trainerObj);
    } else {
      return callback(new Error('No api url received!'));
    }
  });
}


function getAvailableTrainers(username, callback) {
  trainerRepo.findOnlineTrainers(username, function(trainers) {
    callback(trainers);
  });
}

module.exports = {
  /**
  * Log in on the Niantic servers using a PTC account
  * Fetch unique login identification using initial handshake request
  * @param String username
  * @param String password
  * @param Function callback , post login and error handling function
  */
  pokemonClub : function(credentials, callback) {
    var options = {
      url: config.LOGIN_URL,
      headers: config.REQ_HEADERS
    };

    console.log('[!] First request : Handshake')
    request.get(options, function(err, response, body) {
      ptcHandshakeCallback(err, response, body, credentials, callback);
    });
  },

  /**
  *
  */
  googleOAuth: function(credentials, callback) {
      var authObjects = {
        ticket : undefined,
        token : undefined,
        endpoint : undefined
      }
    google.login(credentials.username, credentials.password, config.ANDROID_ID, function(error, data) {
      if (error) {
        console.log('[#] Error logging into Google services')
        return callback(error);
      } else if (data) {
        google.oauth(credentials.username, data.masterToken, data.androidId, config.OAUTH_SERVICE, config.APP, config.CLIENT_SIG, function(error, data) {
          if (error) {
            console.log('[#] Error retrieving oauth data from Google services')
            return callback(error);
          }
          console.log('[!] Google login succesfull');
          authObjects.token = data.Auth;
          postTokenCallback(authObjects, credentials, callback);
        })
      }
    })
  },
  getAvailableTrainers : getAvailableTrainers
}
