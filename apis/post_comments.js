var
  user_model              = require('../models/user'),
  post_model              = require('../models/post'),
  post_like_model         = require('../models/post_like'),
  post_comment_model      = require('../models/post_comment'),
  functions               = require('../helpers/functions');

exports.show  = function(token, id, callback){

};

exports.index  = function(token, post_id, page, page_size, callback){
  page               = parseInt(page <= 0 || page === undefined ? 0 : page - 1);
  page_size          = parseInt(page_size < 0 || page_size === undefined ? 10 : page_size);

  user_model
  .findOne({token: token}, function(err, user){
    if(user){
      var
        user_id            = user._id;
      post_model
      .findOne({_id: post_id}, function(err, post){
        if(post){
            post_comment_model
            .find({post_id: post_id})
            .skip(page*page_size)
            .limit(page_size)
            .sort('-created_on')
            .populate({path: 'user_id', select: '-hashed_password -salt -token'})
            .populate('post_id')
            .exec(err, function(err, post_comments){
              if(post_comments){
                callback({
                  status: 'success',
                  msg: 'List of post comments',
                  post: post,
                  post_comments: post_comments,
                });
              } else {
                callback({
                  status: 'success',
                  msg: 'List of post comments',
                  post: post,
                  post_comments: [],
                });
              }
          });
        } else {
          callback({status: 'error', errors: [{
              param: 'post_id',
              msg: "Invalid post id",
              value: post_id
            }]
          });
        }
      });

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

// action to create comment on the post
exports.create  = function(token, comment, post_id, status, callback){
  // find the user from the token
  user_model.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id            = user._id;
      // find the post which is being commented from the post id
      post_model
      .findOne({_id: post_id})
      .populate({path: 'user_id', select: '-hashed_password -salt -token'})
      .exec(function(err, post){
        if(post){

          var newpostcomment = new post_comment_model({
                  comment: comment,
                  user_id: user_id,
                  post_id: post_id,
                  status: status,
                });

            // save the post_comment and send success message if no error found while saving it
            newpostcomment.save(function(err, newpostcomment){
              if(!err){
                console.log("****", newpostcomment);
                post_comment_model
                .findOne({_id: newpostcomment._id})
                .populate({path: 'user_id', select: '-hashed_password -salt -token'})
                .populate({path: 'post_id'})
                .exec(function(err, newpostcomment){

                  callback({
                    status: 'success',
                    msg: "Successfully commented.",
                    // the current post
                    post: post,
                    // the current post_like
                    post_comment: newpostcomment
                  });
                });


              } else {
                // if post_like validation failed while saving it. log the err for more details
                callback({status: 'error', errors: [{
                    param: 'post_comment',
                    msg: "post_comment validation failed",
                    value: ''
                  }]
                });
              }

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


// action to update comment on the post
exports.update  = function(token, comment, post_id, post_comment_id, status, callback){
  // find the user from the token
  user_model.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id            = user._id;
      // find the post which is being commented from the post id
      post_model
      .findOne({_id: post_id})
      .populate({path: 'user_id', select: '-hashed_password -salt -token'})
      .exec(function(err, post){
        if(post){
          post_comment_model
          .findOne({_id: post_comment_id})
          .populate({path: 'user_id', select: '-hashed_password -salt -token'})
          .populate({path: 'post_id'})
          .exec(function(err, post_comment){
            if(post_comment){
              post_comment.comment = comment;
              post_comment.updated_on = new Date();
              post_comment.save(function(err){
                if(!err){

                  callback({
                    status: 'success',
                    msg: "Successfully comment updated.",
                    // the current post
                    post: post,
                    // the current post_like
                    post_comment: post_comment
                  });
                } else {
                  // if post_comment validation failed while saving it. log the err for more details
                  callback({status: 'error', errors: [{
                      param: 'post_comment',
                      msg: "post_comment validation failed",
                      value: ''
                    }]
                  });
                }
              });
            } else {
              callback({status: 'error', errors: [{
                  param: 'post_comment_id',
                  msg: "Invalid post comment id.",
                  value: post_comment_id
                }]
              });
            }
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


exports.delete  = function(token, id, callback){

};
