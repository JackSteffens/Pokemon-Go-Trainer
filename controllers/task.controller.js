// Dependencies
var config = require('../config.js');
var taskService = require(__dirname+'/../services/task.service.js');
var request = require('request');
var path = require('path');
var colors = require('colors');

/**
* Calls the loop cycle task for a Trainer object
* @param String req.query.username , unique identifier for a Trainer
* @param res return call.
* @return Don't return anything or it will cancel the loop cycle thread!
*/
function traversePath(req, res) {
  var username = req.query.username || null;
  if (!username) {
    res.status('400');
    return res.send('No username supplied');
  }
  taskService.traversePath(username, function(error, message) {
    if (error) {
      console.log(error)
      res.status('400');
      return res.send(error);
    } else if (message) {
      console.log(message.cyan);
    }
  });
}

function scan(req, res) {
  var username = req.query.username || null;
  if (!username) {
    res.status('400');
    return res.send('No username supplied');
  }
  taskService.scan(username, function(error, message) {
    if (error) {
      console.log(('[!]'+error).red)
      res.status('400');
      return res.send(error);
    } else if (message) {
      console.log(message);
      return res.send(message);
    }
  })
}

module.exports = {
  traversePath : traversePath,
  scan : scan
}
