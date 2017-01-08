'use strict';

var bodyParser = require('body-parser');  // ?? request parser ??
var request = require('request');         // HTTP requests
var protobuf = require('protobufjs');     // Decoding responses using .proto
var GoogleOAuth = require('gpsoauthnode');// Google authentication

// Protocol Buffer
var builder = protobuf.loadProtoFile('POGOProtos.proto');
if (builder === null) {
  var builder = protobuf.loadProtoFile(__dirname+'/models/proto/POGOProtos.proto');
  if (builder === null)
    console.log('[!] No .proto file found!');
}
var Proto = builder.build();
var RequestNetwork = Proto.POGOProtos.Networking.Requests;
var ResponseNetwork = Proto.POGOProtos.Networking.Responses;
var RequestEnvelope = Proto.POGOProtos.Networking.Envelopes.RequestEnvelope;
var ResponseEnvelope = Proto.POGOProtos.Networking.Envelopes.ResponseEnvelope;

// Google oAuth
var google = new GoogleOAuth();

// Server URL
var LOGIN_URL = "https://sso.pokemon.com/sso/login?service=https%3A%2F%2Fsso.pokemon.com%2Fsso%2Foauth2.0%2FcallbackAuthorize";
var LOGIN_OAUTH = "https://sso.pokemon.com/sso/oauth2.0/accessToken";
var API_URL = "https://pgorelease.nianticlabs.com/plfe/rpc";
var ANDROID_ID = "9774d56d682e549c";
var REQ_HEADERS = {'User-Agent' : 'Niantic App'};
var OAUTH_SERVICE = 'audience:server:client_id:848232511240-7so421jotr2609rmqakceuu1luuq0ptb.apps.googleusercontent.com';
var APP = 'com.nianticlabs.pokemongo';
var CLIENT_SIG = '321187995bc7cdc2b5fc91b11a96e2baa8602c62';
request = request.defaults({jar: request.jar()}); // For some reason this shit is needed to log in.

function api_req(trainerObj, req, callback) {
  console.log('[i] Performing api request with trainer : ');
  console.log(trainerObj);
  var auth = new RequestEnvelope.AuthInfo({
    provider: trainerObj.provider,
    token: new RequestEnvelope.AuthInfo.JWT(trainerObj.token, 59)
  });

  var f_req = new RequestEnvelope({
    status_code: 2,
    request_id: 1469378659230941192,
    requests: req,
    latitude: parseFloat(trainerObj.latitude),
    longitude: parseFloat(trainerObj.longitude),
    altitude: parseFloat(trainerObj.altitude),
    auth_info: auth,
    unknown12: 989
  });

  var protoMsg = f_req.encode().toBuffer();

  var options = {
    url: trainerObj.apiEndpoint ? trainerObj.apiEndpoint : API_URL,
    body: protoMsg,
    encoding: null,
    headers: REQ_HEADERS
  }

  request.post(options, function(error, res, body) {
    if (res === undefined || body === undefined) {
      console.warn('[!] Pokémon Go server is unreachable. Might be offline.');
      return callback(new Error('Pokémon Go server is unreachable.'))
    } else if (error) {
      console.log(error);
      return callback(error)
    }

    try {
      var response = ResponseEnvelope.decode(body);
    } catch (e) {
      if (e.decoded) {
        console.warn(e);
        response = e.decoded; // Incomplete decoded message
      }
    }

    if (response) {
      return callback(null, response);
    } else {
      console.log("[!] Something went wrong. Retrying api request.")
      api_req(trainerObj, req, callback);
    }
  });
}

module.exports = {
  pokemonClub : function(user, pass, callback) {
    var authObjects = {
      ticket : undefined,
      token : undefined,
      endpoint : undefined
    }
    var options = {
      url: LOGIN_URL,
      headers: REQ_HEADERS
    };

    console.log('[!] Trying first request. Handshake')
    // console.log('[i] Options :');
    // console.log(options);
    // FIRST REQUEST //
    request.get(options, function (err, response, body) {
      var data;

      if (err) {
        console.log('[#] '+err);
        return callback(err, null);
      }

      try {
        // TODO This fucks up after logging in for a second time.
        data = JSON.parse(body);
      }catch(err){
        console.log('[#] '+err);
        if (!data) {
          return callback(err, null);
        }
      }


      console.log('[!] First request successful.');
      // console.log('[i] Data : ');
      // console.log(data);

      options = {
        url: LOGIN_URL,
        form: {
          'lt': data.lt,
          'execution': data.execution,
          '_eventId': 'submit',
          'username': user,
          'password': pass
        },
        headers: REQ_HEADERS
      };

      console.log('[!] Trying second request. Log in.')
      // console.log('[i] Options : ');
      // console.log(options);
      // SECOND REQUEST //
      request.post(options, function (err, response, body) {
        //Parse body if any exists, callback with errors if any.
        if(err) {
          return callback(err, null);
        }

        if (body) {
          var parsedBody = JSON.parse(body);
          if (parsedBody.errors && parsedBody.errors.length !== 0) {
            console.log(parsedBody.errors[0]);
            return callback(new Error('Error logging in: ' + parsedBody.errors[0]), null);
          }
        }

        console.log('[!] Second request successful');
        // console.log('[i] response headers : ');
        // console.log(response.headers);

        var ticket = response.headers['location'].split('ticket=')[1];
        console.log('[i] ticket : '+ticket);
        if (!ticket) {
          return callback('No ticket found!', null);
        }

        authObjects.ticket = ticket;

        options = {
          url: LOGIN_OAUTH,
          form: {
            'client_id': 'mobile-app_pokemon-go',
            'redirect_uri': 'https://www.nianticlabs.com/pokemongo/error',
            'client_secret': 'w8ScCUXJQc6kXKw8FiOhd8Fixzht18Dq3PEVkUCP5ZPxtgyWsbTvWHFLm2wNY0JR',
            'grant_type': 'refresh_token',
            'code': ticket
          },
          headers: REQ_HEADERS
        };

        console.log('[!] Trying third request. Token');
        // console.log('[i] Options : ');
        // console.log(options);
        // THIRD REQUEST //
        request.post(options, function (err, response, body) {
          var token;

          if(err) {
            console.log('[#] '+err);
            return callback(err, null);
          }

          token = body.split('token=')[1];
          if(!token) return callback(new Error('Login failed'), null);
          token = token.split('&')[0];

          if (!token) {
            return callback(new Error('Login failed. No token recieved!'), null);
          }

          authObjects.token = token;
          console.log('[i] Session token: ' + token);
          callback(null, authObjects);
          // Do another request to receive server endpoint.
          // Store all info in an object and return through callback(null, [object])
          // Server.js should store the object in a player model.
        });
      });
    });
  },
  // End pokemonClub() function

  googleOAuth: function(user, pass, callback) {
      var authObjects = {
        ticket : undefined,
        token : undefined,
        endpoint : undefined
      }
    google.login(user, pass, ANDROID_ID, function(error, data) {
      if (error) {
        console.log('[#] Error logging into Google services')
        return callback(error);
      }else if (data) {
        google.oauth(user, data.masterToken, data.androidId, OAUTH_SERVICE, APP, CLIENT_SIG, function(error, data) {
          if (error) {
            console.log('[#] Error retrieving oauth data from Google services')
            return callback(error);
          }
          console.log('[i] Google login succesfull');
          authObjects.token = data.Auth;
          callback(null, authObjects);
        })
      }
    })
  },
  // End googleOAuth() function

  getApiEndpoint: function(trainerObj, callback) {
    var req = [
      new RequestNetwork.Request(2),
      new RequestNetwork.Request(126),
      new RequestNetwork.Request(4),
      new RequestNetwork.Request(129),
      new RequestNetwork.Request(5)
    ];

    api_req(trainerObj, req, function (error, response) {
      if (error) {
        return callback(error);
      }

      if (response.api_url) {
        var api_endpoint = "https://" + response.api_url + "/rpc";
        trainerObj.apiEndpoint = api_endpoint;
        console.log("[i] ApiEndpoint received! : "+api_endpoint);
        return callback(null, trainerObj);
      } else {
        return callback('[#] No api url received!')
      }
    });
  },
  // End getApiEndpoint() function

  getTrainerData: function(trainerObj, callback) {
    var req = new RequestNetwork.Request(2);
    api_req(trainerObj, req, function(error, response) {
      if (error) {
        return callback(error);
      } else if (!response || !response.returns || !response.returns[0]) {
        return callback('[#] No results');
      }

      var statistics = ResponseNetwork.GetPlayerResponse.decode(response.returns[0]);
      console.log(statistics.player_data);
      return callback(null, statistics.player_data);

    })
  },
  // End getTrainerData() function

  getTrainerInventory: function(trainerObj, callback) {
    var req = new RequestNetwork.Request(4);
      // console.log(req);

    api_req(trainerObj, req, function(error, response) {
      if (error) {
        return callback(error);
      } else if (!response || !response.returns || !response.returns[0]) {
        console.log(response)
        return callback('[#] No results');
      }

      var data = ResponseNetwork.GetInventoryResponse.decode(response.returns[0]);

      var inventoryObj = {
        applied_items: [],
        candies: [],
        egg_incubators: [],
        inventory_upgrades: [],
        items: [],
        player_currency: [],
        player_stats: [],
        pokedex_entry: [],
        pokemon_data: []
        // raw: data
      }

      for (var index in data.inventory_delta.inventory_items) {
        if (data.inventory_delta.inventory_items[index].inventory_item_data.applied_items != null) {
          inventoryObj.applied_items.push(data.inventory_delta.inventory_items[index].inventory_item_data.applied_items);
        }

        if (data.inventory_delta.inventory_items[index].inventory_item_data.candy != null) {
          inventoryObj.candies.push(data.inventory_delta.inventory_items[index].inventory_item_data.candy);
        }

        if (data.inventory_delta.inventory_items[index].inventory_item_data.egg_incubators != null) {
          for (var incubator in data.inventory_delta.inventory_items[index].inventory_item_data.egg_incubators.egg_incubator) {
            inventoryObj.egg_incubators.push(incubator);
          }
        }

        if (data.inventory_delta.inventory_items[index].inventory_item_data.inventory_upgrades != null) {
          inventoryObj.inventory_upgrades.push(data.inventory_delta.inventory_items[index].inventory_item_data.inventory_upgrades);
        }

        if (data.inventory_delta.inventory_items[index].inventory_item_data.item != null) {
          inventoryObj.items.push(data.inventory_delta.inventory_items[index].inventory_item_data.item);
        }

        if (data.inventory_delta.inventory_items[index].inventory_item_data.player_currency != null) {
          inventoryObj.player_currency.push(data.inventory_delta.inventory_items[index].inventory_item_data.player_currency);
        }

        if (data.inventory_delta.inventory_items[index].inventory_item_data.player_stats != null) {
          inventoryObj.player_stats.push(data.inventory_delta.inventory_items[index].inventory_item_data.player_stats);
        }

        if (data.inventory_delta.inventory_items[index].inventory_item_data.pokedex_entry != null) {
          inventoryObj.pokedex_entry.push(data.inventory_delta.inventory_items[index].inventory_item_data.pokedex_entry);
        }

        if (data.inventory_delta.inventory_items[index].inventory_item_data.pokemon_data != null) {
          inventoryObj.pokemon_data.push(data.inventory_delta.inventory_items[index].inventory_item_data.pokemon_data);
        }
      }

      console.log(inventoryObj);
      return callback(null, inventoryObj);
    });
  },
  // End getTrainerInventory() function

  getTrainerProfile: function (trainerObj, callback) {
    var req = new RequestNetwork.Request(121);

    api_req(trainerObj, req, function(error, response) {
      if (error) {
        return callback(error);
      } else if (!response || !response.returns || !response.returns[0]) {
        console.log(response);
        return callback('[#] No results');
      }

      var data = ResponseNetwork.GetPlayerProfileResponse.decode(response.returns[0]);

      console.log(data);
      return callback(null, data);
    })
  }
}
