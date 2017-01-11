// Dependencies
var path = require('path');
var config = require('../config.js');
var CustomAPI = require('../CustomAPI.js');
var trainerRepo = require(path.resolve(__dirname+'/../repositories/trainer.repository.js'))
var badgeRepo = require(path.resolve(__dirname+'/../repositories/badge.repository.js'))

var request = require('request');         // HTTP requests
var protobuf = require('protobufjs');     // Decoding responses using .proto
var GoogleOAuth = require('gpsoauthnode');// Google authentication
var Long = require('long')                // Long for date timestamps

// Google oAuth
var google = new GoogleOAuth();
request = request.defaults({jar: request.jar()}); // For some reason this shit is needed to log in.

/**
* Authenticate on the Niantic servers using the identification tokens
* from the handshake request and character credentials given by the user.
* @param String err, errors from the request function
* @param String response, response from the request function
* @param Object body, body from the request function
* @param Object authObjects, contains the ticket, token & endpoint
* @param Object credentials, contains data equired for authentication
* @param Function callback, post login & error handling function
*/
function ptcHandshakeCallback(err, response, body, authObjects, credentials, callback) {
  var data;

  if (err) {
    console.log('[#] '+err);
    return callback(err, null);
  }

  try {
    // FIXME This fucks up after logging in for a second time.
    data = JSON.parse(body);
  }catch(err){
    console.log('[#] '+err);
    if (!data) {
      return callback(err, null);
    } else {
      console.log("recieved data :");
      console.log(data);
    }
  }
  console.log('[!] First request successful.');
  console.log('[!] Second request : Log in.');
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
    ptcLoginCallback(err, response, body, authObjects, credentials, callback)
  });
}

/**
*
* @param String err, errors from the request function
* @param String response, response from the request function
* @param Object body, body from the request function
* @param Object authObjects, contains the ticket, token & endpoint
* @param Object credentials, contains data equired for authentication
* @param Function callback, post login & error handling function
*/
function ptcLoginCallback(err, response, body, authObjects, credentials, callback) {
  if(err) {return callback(err, null);}

  if (body) {
    var parsedBody = JSON.parse(body);
    if (parsedBody.errors && parsedBody.errors.length !== 0) {
      console.log(parsedBody.errors[0]);
      return callback(new Error('Error logging in: ' + parsedBody.errors[0]), null);
    }
  }

  console.log('[!] Second request successful');

  var ticket = response.headers['location'].split('ticket=')[1];
  if (!ticket) {return callback('No ticket found!', null);}
  console.log('[!] ticket : '+ticket);

  authObjects.ticket = ticket;

  console.log('[!] Third request : Token');
  options = {
    url: config.LOGIN_OAUTH,
    form: {
      'client_id': config.CLIENT_ID,
      'redirect_uri': 'https://www.nianticlabs.com/pokemongo/error',
      'client_secret': config.CLIENT_SECRET,
      'grant_type': 'refresh_token',
      'code': ticket
    },
    headers: config.REQ_HEADERS
  };
  // THIRD REQUEST //
  request.post(options, function(err, response, body) {
    if(err) {
      console.log('[#] '+err);
      return callback(err, null);
    }

    var token;
    token = body.split('token=')[1];
    if(!token) return callback(new Error('Login failed'), null);
    token = token.split('&')[0];

    if (!token) {
      return callback(new Error('Login failed. No token recieved!'), null);
    }

    authObjects.token = token;
    console.log('[!] Session token: ' + token);
    postTokenCallback(authObjects, credentials, callback);
  });
}

/**
*
* @param String err, errors from the request function
* @param String response, response from the request function
* @param Object body, body from the request function
* @param Object authObjects, contains the ticket, token & endpoint
* @param Object credentials, contains data equired for authentication
* @param Function callback, post login & error handling function
*/
function postTokenCallback(authObjects, credentials, callback) {
  var trainerObj = {
    login: {
      provider: (credentials.provider).toString(),
      username: credentials.username,
      ticket: authObjects.ticket,
      accessToken: authObjects.token,
      apiEndpoint: undefined,
    },
    location: {
      latitude: parseFloat(credentials.latitude),
      longitude: parseFloat(credentials.longitude),
      altitude: parseFloat(credentials.altitude)
    },
    username: undefined, // Not your login username, but in-game one.
    currency: {
      pokecoin: 0,
      stardust: 0
    }
  }
  getApiEndpoint(trainerObj, function(error, trainerObj) {
    if (error) {callback(error, null); return;}
    getTrainerData(trainerObj, function(error, statistics) {
      if (error) {callback(error, null); return;}
      trainerObj = parseTrainerData(trainerObj, statistics);

      getTrainerProfile(trainerObj, function(error, badges) {
        if (badges)
          getTrainerProfileCallback(trainerObj, badges);
        else
          console.log('[!] No badges returned from Niantic server')
      }); // getTrainerProfile

      // Check if exists, update. Else, create new.
      trainerRepo.findTrainer(trainerObj.username, function(error, oldTrainer) {
        if (error) {
          callback(error, null);
          return;
        } else if (oldTrainer) {
          console.log("[!] Trainer exists. Updating database")
          console.log(trainerObj);
          updateTrainer(trainerObj, callback);
        } else {
          console.log("[!] New trainer. Storing in database")
          createTrainer(trainerObj, callback);
        }
      }); // findTrainer
    }); // getTrainerData
  }); // getApiEndpoint
}

function parseTrainerData(trainerObj, statistics) {
  trainerObj.creation_timestamp = new Long(
    statistics.creation_timestamp_ms.low,
    statistics.creation_timestamp_ms.high,
    statistics.creation_timestamp_ms.unsigned);
  trainerObj.username = statistics.username;
  trainerObj.currency.pokecoin = statistics.currencies[0].amount;
  trainerObj.currency.stardust = statistics.currencies[1].amount;
  trainerObj.max_pokemon_storage = statistics.max_pokemon_storage;
  trainerObj.max_item_storage = statistics.max_item_storage;
  trainerObj.team = statistics.team;
  trainerObj.avatar = {
    skin: statistics.avatar.skin,
    hair: statistics.avatar.hair,
    shirt: statistics.avatar.shirt,
    pants: statistics.avatar.pants,
    hat: statistics.avatar.hat,
    shoes: statistics.avatar.shoes,
    gender: statistics.avatar.gender,
    eyes: statistics.avatar.eyes,
    backpack: statistics.avatar.backpack
  };
  trainerObj.daily_bonus = {
    next_collected_timestamp: new Long(
      statistics.daily_bonus.next_collected_timestamp_ms.low,
      statistics.daily_bonus.next_collected_timestamp_ms.high,
      statistics.daily_bonus.next_collected_timestamp_ms.unsigned),
    next_defender_bonus_collect_timestamp :new Long(
      statistics.daily_bonus.next_defender_bonus_collect_timestamp_ms.low,
      statistics.daily_bonus.next_defender_bonus_collect_timestamp_ms.high,
      statistics.daily_bonus.next_defender_bonus_collect_timestamp_ms.unsigned)
  };

  return trainerObj;
}

function getTrainerProfileCallback(trainerObj, badges) {
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

function getTrainerProfile(trainerObj, callback) {
  var req = new CustomAPI.RequestNetwork.Request(121);

  CustomAPI.api_req(trainerObj, req, function apiCallback(error, response) {
    if (error) {
      return callback(error);
    } else if (!response || !response.returns || !response.returns[0]) {
      console.log('[!] No response, retrying call');
      CustomAPI.api_req(trainerObj, req, apiCallback);
    } else {
      var data = CustomAPI.ResponseNetwork.GetPlayerProfileResponse.decode(response.returns[0]);
      console.log('[i] Badges fetched!')
      return callback(null, data);
    }
  })
}

function getTrainerData(trainerObj, callback) {
  var req = new CustomAPI.RequestNetwork.Request(2);
  CustomAPI.api_req(trainerObj, req, function(error, response) {
    if (error) {
      callback(error);
      return;
    } else if (!response || !response.returns || !response.returns[0]) {
      callback('[#] No results');
      return;
    }

    var statistics = CustomAPI.ResponseNetwork.GetPlayerResponse.decode(response.returns[0]);
    callback(null, statistics.player_data);
  })
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
      return callback('[#] No api url received!');
    }
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
    var authObjects = {
      ticket : undefined,
      token : undefined,
      endpoint : undefined
    }
    var options = {
      url: config.LOGIN_URL,
      headers: config.REQ_HEADERS
    };

    console.log('[!] First request : Handshake')
    request.get(options, function(err, response, body) {
      ptcHandshakeCallback(err, response, body, authObjects, credentials, callback);
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

  getAvailableTrainers : function(username, callback) {
    trainerRepo.findOnlineTrainers(username, function(trainers) {
      callback(trainers);
    });
  }
}
