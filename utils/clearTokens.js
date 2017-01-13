// Dependencies
var trainerService = require('../services/trainer.service.js');

/**
* Wipes API tokens from all known characters.
* If the server has been down for a period of time it's possible that the
* stored API keys are no longer valid. This forces accounts to relog and
* request a fresh API key from the Niantic servers.
*/
exports.init = function() {
  trainerService.getAvailableTrainers(null, function(error, trainers) {
    console.log("[i] Logging out ["+trainers.length+"] local users");
    for (var i = 0; i < trainers.length; i++) {
      trainerService.logout(trainers[i].username, function(error, trainer) {
        if (error) console.log('[!] Failed to logout user .\n'+error);
      })
    }
  });
}
