'use strict';
// Dependencies
var config = require('./config.js');
var request = require('request');
var protobuf = require('protobufjs');

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

// Configuration
request = request.defaults({jar: request.jar()});

/**
* Performs a call to the Niantic servers
* @param Trainer {trainerObj}
* @param RequestNetwork.Request(x) {requestType} , Protobuf build
* @param callback(Error error, Object response)
* @param ResponseNetwork {responseType} , Decode Protobuf build. OPTIONAL
*/
function api_req(trainerObj, requestType, callback, responseType) {
  // Pre-login this will print 'undefined' because the username isn't known until post-login
  console.log('[i] Performing api request with trainer : '+trainerObj.username);
  var auth = new RequestEnvelope.AuthInfo({
    provider: trainerObj.login.provider,
    token: new RequestEnvelope.AuthInfo.JWT(trainerObj.login.accessToken, 59)
  });

  var f_req = new RequestEnvelope({
    status_code: 2,
    request_id: config.REQUEST_ID,
    requests: requestType,
    latitude: parseFloat(trainerObj.location.latitude),
    longitude: parseFloat(trainerObj.location.longitude),
    altitude: parseFloat(trainerObj.location.altitude),
    auth_info: auth,
    unknown12: 989
  });

  var options = {
    url: trainerObj.login.apiEndpoint ? trainerObj.login.apiEndpoint : config.API_URL,
    body: f_req.encode().toBuffer(),
    encoding: null,
    headers: config.REQ_HEADERS
  }

  request.post(options, function(error, res, body) {
    if (res === undefined || body === undefined) {
      return callback(new Error('Pokémon Go server is unreachable. Might be offline'));
    } else if (error) {
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

    /**
    * Certain requests require decoding the response
    * Example : Fetching a Trainer profile requires decoding.
    *           Requesting authorization does not require decoding.
    */
    if (responseType) {
      if (response && response.returns && response.returns[0]) {
        var decodedResponse = responseType.decode(response.returns[0]);
        return callback(null, decodedResponse);
      } else {
        console.log("[!] Empty response. Retrying api request.")
        api_req(trainerObj, requestType, callback, responseType);
      }
    } else if (response) {
      return callback(null, response);
    } else {
      console.log("[!] Empty response. Retrying api request.")
      api_req(trainerObj, requestType, callback, responseType);
    }
  });
}

// Export
module.exports = {
  // Protocol Buffers
  RequestNetwork : RequestNetwork,
  ResponseNetwork : ResponseNetwork,
  RequestEnvelope : RequestEnvelope,
  ResponseEnvelope : ResponseEnvelope,
  api_req : api_req
}
