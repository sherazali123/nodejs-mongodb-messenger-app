var
  crypto      = require('crypto'),
  rand        = require('csprng'),
  mongoose    = require('mongoose'),
  user        = require('../models/user'),
  dateFormat  = require('dateformat');

exports.register = function(email, password, gender, display_name, phone_no, dob, mood, status, callback){
  var
    // a random string used add salt in the password
    temp              = rand(160, 36),
    // generate new password
    newpass           = temp + password,
    // create token from the email and rand (csprng) mdoule
    token             = crypto.createHash('sha512').update(email +rand).digest("hex"),
    hashed_password   = crypto.createHash('sha512').update(newpass).digest("hex"),
    // create user instance from userSchema to register new user
    newuser           = new user({
     token: token,
     email: email,
     hashed_password: hashed_password,
     gender: gender,
     salt: temp,
     display_name: display_name,
     phone_no: phone_no,
     dob: dob,
     mood: mood,
     status: status
    });
  // find if email already exists
  user.find({email: email},function(err,users){
    var
      // number of users found with the given email
      len = users.length;
    // register only if no user found in the users collection
    if(len === 0){
      newuser.save(function (err) {
        callback({status: 'success', msg: "Sucessfully Registered", user: {
          token: newuser.token,
          email: newuser.email,
          gender: newuser.gender,
          display_name: newuser.display_name,
          phone_no: newuser.phone_no,
          dob: dateFormat(newuser.dob, "yyyy/mm/dd"),
          mood: newuser.mood,
          status: newuser.status
        }});
      });
    } else {
      callback({status: 'error', errors: [{
          param: "email",
          msg: "Email already registered.",
          value: email
        }
      ]});
    }
  });

};
