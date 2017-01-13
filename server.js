'use strict';

// Dependencies
var express = require('express');         // Server
var mongoose = require('mongoose');       // Database
var morgan = require('morgan');           // Console logging
var bodyParser = require('body-parser');  // ?? request parser ??
var fs = require('fs');                   // FileStream
var config = require('./config.js');      // Config params
var router = require('./routes.js');      // Controller routing
var clearTokens = require('./utils/clearTokens.js'); // Clearing tokens

// Configuration
var app = express();
var self = this;
mongoose.connect(config.DATABASE); // Connect to DB
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended' : 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type : 'application/vnd.api+json'}));

// Set routing
router.setRequestUrl(app);

// Start server
app.listen(3000, 'localhost', function() {
  clearTokens.init();
  console.log(
    "---------------------------------------------------------\n\n" +
    "                        Pokémon Go                         \n" +
    "                   Advanced Interface                      \n" +
    "_________________________________________________________  \n"
  );
  console.log("[i] Server started on localhost:3000");
});
