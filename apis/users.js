var
  user_model            = require('../models/user'),
  user_follower_model   = require('../models/user_follower'),
  post_model            = require('../models/post'),
  post_like_model       = require('../models/post_like'),
  post_comment_model    = require('../models/post_comment'),
  dateFormat            = require('dateformat');

exports.show = function(token, callback){
  user_model.findOne({token: token}, function(err, user){

    if(user){
      callback({status: 'success', msg: 'User found.', user: {
        email: user.email,
        gender: user.gender,
        token: token,
        display_name: user.display_name,
        phone_no: user.phone_no,
        dob: dateFormat(user.dob, "yyyy/mm/dd"),
        mood: user.mood,
        status: user.status,
        avatar: user.avatar
      }});
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

// retreiving profile all the data that is going to be shown on profile display
exports.user_profile = function(token, user_profile_id, callback){
  user_model.findOne({token: token}, function(err, user){

    if(user){

      user_model.findOne({_id: user_profile_id}, function(err2, user_profile){
        if(user_profile){

          var user_data = {basic: {
            _id: user_profile._id,
            email: user_profile.email,
            gender: user_profile.gender,
            display_name: user_profile.display_name,
            phone_no: user_profile.phone_no,
            dob: dateFormat(user.dob, "yyyy/mm/dd"),
            mood: user_profile.mood,
            status: user_profile.status,
            avatar: user_profile.avatar,
            profile: (user._id === user_profile._id ? 'mine' : 'not_mine'),
            is_following: false,
          }};

          post_model
          .find({user_id: user_data.basic._id, status: 1})
          .populate({path: 'user_id', select: '-hashed_password -salt -token'})
          .exec(function(err, posts){
            if(!err){
              user_data.posts = {total_posts: posts.length, posts: posts};

              user_follower_model
              .find({follower: user_data.basic._id, status: 1})
              .count(function(err3, total_followers){
                if(!err3){
                  user_data.follower = {total_followers: total_followers};

                  user_follower_model
                  .find({following: user_data.basic._id, status: 1})
                  .count(function(err4, total_following){
                    if(!err4){
                      user_data.following = {total_following: total_following};
                      if(user_data.basic.profile === 'not_mine'){
                        // if viewing someone's profile
                        user_follower_model
                        .findOne({follower: user._id, following: user_data.basic._id, status: 1})
                        .count(function(err5, following_found){
                          if(!err5){
                            user_data.basic.is_following = following_found === 1;
                            // print if viewing someone's profile
                            callback({status: 'success', msg: 'User found.', user: user_data});
                          } else {
                            callback({status: 'error', errors: [{
                                param: 'error',
                                msg: 'An error occoured while checking is user following the profile',
                                value: '',
                              }],
                            });
                          }
                        });
                      } else {
                        // if viewing his own profile
                        callback({status: 'success', msg: 'User found.', user: user_data});
                      }


                    } else {
                      callback({status: 'error', errors: [{
                          param: 'error',
                          msg: 'An error occoured while total_followers',
                          value: '',
                        }],
                      });
                    }
                  });

                } else {
                  callback({status: 'error', errors: [{
                      param: 'error',
                      msg: 'An error occoured while total_followers',
                      value: '',
                    }],
                  });
                }
              });


            } else {
              callback({status: 'error', errors: [{
                  param: 'error',
                  msg: 'An error occoured while retreiving posts',
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

exports.index = function(token, callback){

};

exports.create = function(email, password, gender, callback){

};

exports.update = function(token, type, value, callback){
  user_model.findOne({token: token}, function(err, user){

    if(user){
      user[type]         = value;
      user.save();
      callback({status: 'success', msg: 'User updated.', user: {
        email: user.email,
        gender: user.gender,
        token: token,
        display_name: user.display_name,
        phone_no: user.phone_no,
        dob: dateFormat(user.dob, "yyyy/mm/dd"),
        mood: user.mood,
        status: user.status,
        avatar: user.avatar
      }});
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

exports.delete = function(token, callback){

};
