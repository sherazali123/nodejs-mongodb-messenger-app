var
  user_model              = require('../models/user'),
  post_model              = require('../models/post'),
  post_like_model         = require('../models/post_like'),
  post_comment_model      = require('../models/post_comment'),
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

// action to create comment on the post
exports.create  = function(token, comment, post_id, status, callback){
  // find the user from the token
  user_model.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id            = user._id;
      // find the post which is being commented from the post id
      post_model.findOne({_id: post_id}, function(err, post){
        if(post){

          var newpostcomment = new post_comment_model({
                  comment: comment,
                  user_id: user_id,
                  post_id: post_id,
                  status: status,
                });

            // save the post_comment and send success message if no error found while saving it
            newpostcomment.save(function(err){
              if(!err){
                callback({
                  status: 'success',
                  msg: "Successfully commented.",
                  // the current post
                  post: {
                    _id: post_id,
                    image_name: post.image_name,
                    image_path: '/static/uploads/posts/' + user_id + '/' + post.image_name,
                    price: post.price,
                    description: post.description,
                    status: post.status,
                    user_id: post.user_id
                  },
                  // the current post_like
                  post_comment: {
                    _id: newpostcomment._id,
                    comment: newpostcomment.comment,
                    post_id: newpostcomment.post_id,
                    user_id: newpostcomment.user_id,
                    status: newpostcomment.status,
                  }
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
      post_model.findOne({_id: post_id}, function(err, post){
        if(post){

          post_comment_model.findOne({_id: post_comment_id}, function(err, post_comment){
            if(post_comment){
              post_comment.comment = comment;
              post_comment.updated_on = new Date();
              post_comment.save(function(err){
                if(!err){
                  callback({
                    status: 'success',
                    msg: "Successfully comment updated.",
                    // the current post
                    post: {
                      _id: post_id,
                      image_name: post.image_name,
                      image_path: '/static/uploads/posts/' + user_id + '/' + post.image_name,
                      price: post.price,
                      description: post.description,
                      status: post.status,
                      user_id: post.user_id
                    },
                    // the current post_like
                    post_comment: {
                      _id: post_comment._id,
                      comment: post_comment.comment,
                      post_id: post_comment.post_id,
                      user_id: post_comment.user_id,
                      status: post_comment.status,
                    }
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
              })
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
