var
  crypto        = require('crypto'),
  rand          = require('csprng'),
  mongoose      = require('mongoose'),
  gravatar      = require('gravatar'),
  user          = require('../models/user');

exports.login = function(email,password,callback) {

  user.find({email: email}, function(err ,users){

    if(users.length !== 0){

      var
        temp                = users[0].salt,
        hash_db             = users[0].hashed_password,
        id                  = users[0].token,
        newpass             = temp + password,
        hashed_password     = crypto.createHash('sha512').update(newpass).digest("hex"),
        grav_url            = gravatar.url(email, {s: '200', r: 'pg', d: '404'});

      if(hash_db == hashed_password){
        callback({status: 'success', msg: "Sucessfully login", user: {
          token: id,
          email: users[0].email,
          gender: users[0].gender,
          display_name: users[0].display_name,
          phone_no: users[0].phone_no,
          mood: users[0].mood,
          status: users[0].status
        }});
      } else {
        callback({status: 'error', errors: [{
            param: "email",
            msg: "Invalid password.",
            value: email
          }
        ]});
      }
    } else {
      callback({status: 'error', errors: [{
          param: "email",
          msg: "User does not exist.",
          value: email
        }
      ]});
    }
  });
}
