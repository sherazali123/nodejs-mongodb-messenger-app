var
  user          = require('../models/user'),
  post          = require('../models/post'),
  functions     = require('../helpers/functions'),
  mkdirp        = require('mkdirp'),
  fs            = require('fs');

exports.show = function(token, id, callback){

};
exports.index = function(token, page, page_size, callback){
  page               = parseInt(page <= 0 || page === undefined ? 0 : page - 1);
  page_size          = parseInt(page_size < 0 || page_size === undefined ? 10 : page_size);

  user.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id            = user._id;

        console.log("page*page_size => ", page*page_size);
        console.log("page => ",  page);
        console.log("page_size => ",  page_size);
      post.find({user_id: user_id}, function(err, posts){
        callback({status: 'success', msg: 'List of posts', posts: posts
      });

    }).skip(page*page_size).limit(page_size).sort('-created_on');
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
  user.findOne({token: token}, function(err, user){
    if(user){
      var
        user_id             = user._id,
        imageBuffer         = functions.decodeBase64Image(base64),
        image_name          = functions.randomFilename() + '.' + extention,
        directory           = 'public/uploads/posts/' + user_id,
        image_path          = directory + '/' + image_name;

      mkdirp(directory, function(err) {
        // path exists unless there was an error
        console.log("Directory err => ", err);
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
            newpost             = new post({
              image_name: image_name,
              price: price,
              description: description,
              status: status,
              user_id: user_id
            });

          // save new post to the database
          newpost.save(function(err){
            callback({status: 'success', msg: 'Successfully Registered', post: {
              image_name: newpost.image_name,
              image_path: '/static/uploads/posts/' + user_id + '/' + newpost.image_name,
              price: newpost.price,
              description: newpost.description,
              status: newpost.status,
              user_id: newpost.user_id
            }});
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
