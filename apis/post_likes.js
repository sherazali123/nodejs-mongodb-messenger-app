var
  user_model              = require('../models/user'),
  post_model              = require('../models/post'),
  post_like_model         = require('../models/post_like'),
  functions               = require('../helpers/functions');

exports.show  = function(token, id, callback){

};

exports.index  = function(token, id, callback){
  user_model.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id            = user._id;

    } else {
      callback({status: 'error', errors: [{
          param: 'token',
          msg: "Invalid token",
          value: token
        }]
      });
    }
  });
};

// action to like or dislike the post
exports.create  = function(token, is_liked, post_id, status, callback){
  // find the user from the token
  user_model.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id            = user._id;
      // find the post which is being liked or disliked from the post id
      post_model
      .findOne({_id: post_id})
      .populate({path: 'user_id', select: '-hashed_password -salt -token'})
      .exec(function(err, post){
        if(post){
          // find the post like from the user_id and post_id
          post_like_model
          .findOne({user_id: user_id, post_id: post_id})
          .populate({path: 'user_id', select: '-hashed_password -salt - token'})
          .populate({path: 'post_id'})
          .exec(function(err, post_like){
            // update the post_like if user has already liked or disliked the post
            if(post_like){
              post_like.is_liked = is_liked;
              post_like.updated_on = new Date();

            } else {
              // create a new post_like because this user is liking the post first time
              post_like  = new post_like_model({
                is_liked: is_liked,
                user_id: user_id,
                post_id: post_id,
                status: status,
              });
            }
            // save the post_like and send success message if no error found while saving it
            post_like.save(function(err, post_like){
              if(!err){
                post_like_model
                .findOne({_id: post_like._id})
                .populate({path: 'user_id', select: '-hashed_password -salt -token'})
                .populate({path: 'post_id'})
                .exec(function(err, post_like){
                  callback({
                    status: 'success',
                    msg: (is_liked === true ? 'Liked' : 'Disliked'),
                    // the current post
                    post: post,
                    // the current post_like
                    post_like: post_like
                  });
                });
              } else {
                // if post_like validation failed while saving it. log the err for more details
                callback({status: 'error', errors: [{
                    param: 'post_like',
                    msg: "post_likes validation failed",
                    value: ''
                  }]
                });
              }

            });
          });
        } else {
          // Invalid post_id is being injected
          callback({status: 'error', errors: [{
              param: 'post_id',
              msg: "Invalid post id",
              value: post_id
            }]
          });
        }
      });

    } else {
      // Invalid user token
      callback({status: 'error', errors: [{
          param: 'token',
          msg: "Invalid token",
          value: token
        }]
      });
    }
  });
};


exports.update  = function(token, id, callback){

};

exports.delete  = function(token, id, callback){

};
