exports.setRequestUrl = function(app) {
  // # Controllers #
  var config = require(__dirname+'/config.js');
  var trainer = require("./controllers/trainer.controller.js");
  var map = require("./controllers/map.controller.js");
  var pokedex = require("./controllers/pokedex.controller.js");

  // # Routing #
  // Pokedex
  app.get('/api/pokedex', pokedex.getPokedex);

  // Map
  app.get('/api/map/scanner', map.getScanData);
  app.get('/api/map/convert', map.convertS2ToCoord);
  app.get('/api/map/path', map.getPath);
  app.get('/api/map/scanner/ext', map.getScanDataExternal);

  // Trainer
  app.get('/api/trainer', trainer.getTrainer);
  app.get('/api/trainer/available', trainer.getAvailableTrainers);
  app.post('/api/trainer/login', trainer.login);
  app.post('/api/trainer/logout', trainer.logout);
  app.get('/api/trainer/profile', trainer.getProfile);
  app.get('/api/trainer/inventory', trainer.getInventory);
  app.get('/api/trainer/pokemon', trainer.getPokemon);
  app.get('/api/trainer/pokedex', trainer.getPokedex);
  app.get('/api/trainer/statistics', trainer.getStatistics);
  app.get('/api/trainer/candies', trainer.getCandies);
  app.post('/api/trainer/location', trainer.updateLocation);
  app.post('/api/trainer/destination', trainer.updateDestination);

  // Web application index
  app.get('/', function(req, res) {
    res.sendFile(__dirname+'/public/res/views/index.html');
  });
}
