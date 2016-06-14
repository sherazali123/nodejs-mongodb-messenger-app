var
  user_model              = require('../models/user'),
  user_follower_model     = require('../models/user_follower'),
  functions               = require('../helpers/functions');


  // retreiving profile all the data that is going to be shown on profile display
  exports.follow_or_unfollow = function(token, user_profile_id, is_following, status, callback){
    user_model.findOne({token: token}, function(err, user){

      if(user){

        user_model.findOne({_id: user_profile_id}, function(err2, user_profile){
          if(user_profile){

            user_follower_model
            .findOne({follower: user._id, following: user_profile._id}, function(err, user_follower){
              if(!err){
                if(user_follower){
                  user_follower.status = status;
                  user_follower.updated_on = new Date();
                } else {
                  user_follower = new user_follower_model({
                    follower: user._id,
                    following: user_profile._id,
                    status: status,
                  });
                }
                user_follower.save(function(err, user_follower){
                  if(!err){
                    user_follower_model
                    .findOne({_id: user_follower._id})
                    .populate({path: 'follower', select: '-hashed_password -salt -token'})
                    .populate({path: 'following', select: '-hashed_password -salt -token'})
                    .exec(function(err, user_follower){
                      callback({
                        status: 'success',
                        msg: (status === 0 ? 'unfollowed' : 'Followed'),
                        user_follower: user_follower,
                      });
                    });
                  } else {
                    callback({status: 'error', errors: [{
                        param: 'user_follower',
                        msg: "user_follower save failed",
                        value: ''
                      }]
                    });
                  }
                });
              } else {
                callback({status: 'error', errors: [{
                    param: 'error',
                    msg: 'An error occoured while following/unfollowing.',
                    value: '',
                  }],
                });
              }
            });


          } else {
            callback({status: 'error', errors: [{
                param: 'user_profile_id',
                msg: 'User profile not found.',
                value: user_profile_id,
              }],

            });
          }
        });


      } else {
        callback({status: 'error', errors: [{
            param: 'token',
            msg: 'User not found.',
            value: token,
          }],

        });
      }
    });
  };
