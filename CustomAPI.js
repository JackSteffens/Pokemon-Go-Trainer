'use strict';

var config = require('./config.js');
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
  // Pre-login this will print 'undefined' because the username isn't known until post-login
  console.log('[i] Performing api request with trainer : '+trainerObj.username);
  var auth = new RequestEnvelope.AuthInfo({
    provider: trainerObj.login.provider,
    token: new RequestEnvelope.AuthInfo.JWT(trainerObj.login.accessToken, 59)
  });

  var f_req = new RequestEnvelope({
    status_code: 2,
    request_id: config.REQUEST_ID,
    requests: req,
    latitude: parseFloat(trainerObj.location.latitude),
    longitude: parseFloat(trainerObj.location.longitude),
    altitude: parseFloat(trainerObj.location.altitude),
    auth_info: auth,
    unknown12: 989
  });

  var protoMsg = f_req.encode().toBuffer();

  var options = {
    url: trainerObj.login.apiEndpoint ? trainerObj.login.apiEndpoint : API_URL,
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
  // Protocol Buffers
  RequestNetwork : RequestNetwork,
  ResponseNetwork : ResponseNetwork,
  RequestEnvelope : RequestEnvelope,
  ResponseEnvelope : ResponseEnvelope,
  api_req : api_req,

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
  }
  // End getTrainerInventory() function
}
