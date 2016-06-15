var
  user_model          = require('../models/user'),
  post_model          = require('../models/post'),
  post_like_model     = require('../models/post_like'),
  post_comment_model  = require('../models/post_comment'),
  functions           = require('../helpers/functions'),
  mkdirp              = require('mkdirp'),
  async               = require('async'),
  fs                  = require('fs');

exports.show = function(token, post_id, callback){
  user_model.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id             = user._id;
        post_data           = {};
      post_model
      .findOne({_id: post_id})
      .populate({path: 'user_id', select: '-hashed_password -salt -token'})
      .exec(function(err1, post){
        post_data.basic = post;
        if(post){
          post_comment_model
          .find({post_id: post._id, status: 1})
          .sort('-created_on')
          .populate({path: 'user_id', select: '-hashed_password -salt -token'})
          .populate('post_id')
          .exec(err, function(err, post_comments){
            post_data.comments = {total_comments: post_comments.length, comments: post_comments};

            post_like_model
            .find({post_id: post._id, status: 1})
            .sort('-created_on')
            .populate({path: 'user_id', select: '-hashed_password -salt -token'})
            .populate('post_id')
            .exec(err, function(err, post_likes){
              post_data.likes = {total_likes: post_likes.length, likes: post_likes};

              post.is_liked(user_id, function(err, likes_counter){
                post_data.likes.is_liked = (likes_counter > 0 ? 1 : 0);
                callback({
                  status: "success",
                  msg: "Post information",
                  post: post_data,
                });
              });

            });


          });
        } else {
          callback({status: 'error', errors: [{
              param: 'post_id',
              msg: "Invalid post_id",
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
exports.index = function(token, page, page_size, callback){
  page               = parseInt(page <= 0 || page === undefined ? 0 : page - 1);
  page_size          = parseInt(page_size < 0 || page_size === undefined ? 10 : page_size);

  user_model.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id            = user._id;
      post_model
      .find({user_id: user_id})
      .skip(page*page_size)
      .limit(page_size)
      .sort('-created_on')
      .populate({path: 'user_id', select: '-hashed_password -salt -token'})
      .exec(function(err, posts){
        var iterator = 0;
        var result = [];

        posts.forEach(function(post){
          post.get_no_of_likes(function(err, _likes){
            post.get_no_of_comments(function(err, _comments){
              // check if post is liked by current user
              post.is_liked(user_id, function(err, _is_liked){
                iterator++;
                post  = post.toObject();
                post.no_of_likes = _likes;
                post.no_of_comments = _comments;
                post.is_liked = (_is_liked > 0 ? 1 : 0);
                result.push(post);
                if(iterator == posts.length){
                  callback({
                    status: 'success',
                    msg: 'List of posts',
                    posts: result,
                  });
                }
              });
            });
          });
        });
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
exports.create = function(token, base64, extention, price, description, status, callback){
  user_model.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id             = user._id,
        imageBuffer         = functions.decodeBase64Image(base64),
        image_name          = functions.randomFilename() + '.' + extention,
        directory           = 'public/uploads/posts/' + user_id,
        image_path          = directory + '/' + image_name;

      mkdirp(directory, function(err) {
        // path exists unless there was an error
        if(err){
          callback({status: 'error', errors: [{
              param: 'directory',
              msg: "An error occoured while creating directory.",
              value: directory
            }]
          });
        } else {
          if(imageBuffer === false){
            callback({status: 'error', errors: [{
                param: 'token',
                msg: "Invalid base 64 string",
                value: token
              }]
            });
          }
          fs.writeFile(image_path, imageBuffer.data, function(err) {
            console.log("Image saved!");
          });

          var
            // create new post instance from postSchema to create new post of user
            newpost             = new post_model({
              image_name: image_name,
              price: price,
              description: description,
              status: status,
              user_id: user_id
            });

          // save new post to the database
          newpost.save(function(err, newpost){
            if(!err){
              post_model
              .findOne({_id: newpost._id})
              .populate({path: 'user_id', select: '-hashed_password -salt -token'})
              .exec(function(err, newpost){
                callback({
                  status: 'success',
                  msg: 'Successfully posted.',
                  post: newpost
                });
              });
            } else {
              callback({status: 'error', errors: [{
                  param: 'newpost',
                  msg: "Error! while saving post. Try again.",
                  value: token
                }]
              });
            }

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
exports.update = function(token, base64, extension, price, description, status, callback){

};
exports.delete = function(token, id, callback){

};
