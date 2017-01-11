// Model
var path = require('path')
var Badges = require(path.resolve(__dirname+'/../models/js/badge.model.js')).Badges;

module.exports = {
  /**
  * Fetch badges by user
  */
  findByUsername : function(username, callback) {
    Badges.findOne(
      {'owner':username},
      function (error, badges) {
        if (error)
          console.log('[!] Error fetching badges');
        else if (badges)
          console.log('[i] Found badges for : '+username);
        return callback(error, badges);
      }
    );
  },

  /**
  * Update all badges
  */
  updateBadges : function(username, badges, callback) {
    Badges.findOneAndUpdate(
      {'owner':username},
      badges,
      {
        runValidators:true,
        new:true
      },
      function(error, newBadges) {
        if (error)
          console.log('[!] Error updating badges');
        else
          console.log('[i] Updates bades for : '+username);
        return callback(error, newBadges);
      }
    );
  },

  /**
  * Updating a single badge
  */
  updateBadge : function(username, badge, callback) {
    Badges.update(
      {'owner' : username, 'badges.badge_type':badge.badge_type},
      {'$set' : badge},
      {
        runValidators:true,
        new:true
      },
      function(error, newBadges) {
        if (error) {
          console.log('[!] Error updating badge');
          callback(error, null);
        }
      }
    );
  },

  /**
  * Create new Badges object
  */
  createBadges : function(username, badges, callback) {
    Badges.create({
      owner:username,
      badges:badges
    },
    function(error, newBadges) {
      if (error)
        console.log('[!] Error creating badges');
      else
        console.log('[i] Created badges for : '+username);
      return callback(error, newBadges);
    });
  }
};
