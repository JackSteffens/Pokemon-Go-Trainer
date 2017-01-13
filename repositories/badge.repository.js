// Model
var path = require('path')
var Badges = require(path.resolve(__dirname+'/../models/js/badge.model.js')).Badges;

/**
* Fetch Badges by Trainer username
* @param String username , unique ID
* @param function callback(Error error, Badges badges)
* @return callback(Error error, Badges badges)
*/
function findByUsername(username, callback) {
  Badges.findOne(
    {'owner':username},
    function (error, badges) {
      if (error)console.log('[!] Error fetching badges');
      else if (badges) console.log('[i] Found badges for : '+username);
      return callback(error, badges);
    }
  );
}

/**
* Update all badges from a specific Trainer
* @param String username , unique ID
* @param Badge[] {badges} , array of child Badge objects
* @param function callback(Error error, Badges newBadges)
* @return callback(Error error, Badges newBadges)
*/
function updateBadges(username, badges, callback) {
  Badges.findOneAndUpdate(
    {'owner':username},
    {'badges':badges},
    {runValidators:true, new:true},
    function(error, newBadges) {
      if (error) console.log('[!] Error updating badges');
      else if (newBadges) console.log('[i] Updates bades for : '+username);
      return callback(error, newBadges);
    }
  );
}


/**
* Updating a single badge by username and Badge.badge_type
* @param String username , unique ID
* @param Badge {badge} , new badge that replaced the old one. badge_style required for lookup.
* @param function callback(Error error, Badges newBadges)
* @return callback(Error error, Badges newBadges) returns ALL badges (Badges object)
*/
function updateBadge(username, badge, callback) {
  Badges.update(
    {'owner' : username, 'badges.badge_type':badge.badge_type},
    {'$set' : badge},
    {runValidators:true, new:true},
    function(error, newBadges) {
      if (error) console.log('[!] Error updating badge');
      else if (newBadges) console.log('[i] Updated badge for : '+username+', item : '+badge.badge_type);
      return callback(error, newBadges);
    }
  );
}

/**
* Create new Badges object
* @param String username , unique ID
* @param Badge[] badges , array of child Badge objects
* @param function callback(Error error, Badges newBadges)
* @return callback(Error error, Badges newBadges)
*/
function createBadges(username, badges, callback) {
  Badges.create(
    {'owner':username, 'badges':badges},
    function(error, newBadges) {
      if (error) console.log('[!] Error creating badges');
      else if (newBadges) console.log('[i] Created badges for : '+username);
      return callback(error, newBadges);
    }
  );
}

// Exports
module.exports = {
  findByUsername  : findByUsername,
  updateBadges    : updateBadges,
  updateBadge     : updateBadge,
  createBadges    : createBadges
};
