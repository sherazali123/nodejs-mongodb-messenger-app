var
  crypto              = require('crypto'),
  rand                = require('csprng'),
  mongoose            = require('mongoose'),
  nodemailer          = require('nodemailer'),
  user                = require('../models/user'),
  transporter = nodemailer.createTransport('smtps://messenger.test420%40gmail.com:helloworld!@smtp.gmail.com');

exports.change_password = function(token, old_password, new_password, confirm_new_password, callback) {

  var
    temp1               = rand(160, 36),
    newpass1            = temp1 + new_password,
    hashed_passwordn    = crypto.createHash('sha512').update(newpass1).digest("hex");

  user.find({token: token}, function(err, users){

    if(users.length != 0){

      var
        temp                = users[0].salt,
        hash_db             = users[0].hashed_password; var newpass = temp + old_password,
        hashed_password     = crypto.createHash('sha512').update(newpass).digest("hex");

      if(hash_db == hashed_password){
        user.findOne({ token: token }, function (err, u){
           u.hashed_password = hashed_passwordn;
           u.salt = temp1;
           u.save();

           callback({status: 'success', msg: "Password Sucessfully Changed."});
        });

      } else {
        callback({status: 'error', errors: [{
            param: "password",
            msg: "Passwords do not match. Try Again !",
            value: old_password
          }
        ]});
      }
    } else {
      callback({status: 'error', errors: [{
          param: "password",
          msg: "Error while changing password",
          value: old_password
        }
      ]});
    }

  });
}

exports.reset_password_init = function(email, callback) {

  var
    temp = rand(24, 24);
  user.find({email: email},function(err, users){

    if(users.length != 0){

      user.findOne({ email: email }, function (err, u){
        u.temp_str= temp;
        u.save();

        // setup e-mail data with unicode symbols
        var mailOptions = {
            from: '"Messenger 👥" <messenger.test420@gmail.com>', // sender address
            to: 'sheraz.ali342@gmail.com', // list of receivers
            subject: 'Messenger: Verification Code ✔', // Subject line
            text: "Hello " + u.display_name + ".  Code to reset your Password is " + temp + ".",
        };

        transporter.sendMail(mailOptions, function(error, response){
          console.log("error => ", error);
          console.log("response => ", response);
          if(error){
            callback({status: 'error', errors: [{
                param: "email",
                msg: "Error While Resetting password. Try Again !",
                value: email
              }
            ]});
          } else {
            callback({status: 'success', msg: "Check your Email and enter the verification code to reset your Password."});
          }
        });
      });
    } else {
      callback({status: 'error', errors: [{
          param: "email",
          msg: "Email Does not Exists.",
          value: email
        }
      ]});
    }
  });
}

exports.reset_password_change = function(email, code, new_password,callback) {

  user.find({email: email},function(err,users){

    if(users.length != 0){

      var
        temp              = users[0].temp_str,
        temp1             = rand(160, 36),
        newpass1          = temp1 + new_password,
        hashed_password   = crypto.createHash('sha512').update(newpass1).digest("hex");

      if(temp == code){

        user.findOne({ email: email }, function (err, u){
          u.hashed_password         = hashed_password;
          u.salt                    = temp1;
          u.temp_str                = "";
          u.save();
          callback({status: 'success', msg: "Password Sucessfully Changed"});

        });
      } else {
        callback({status: 'error', errors: [{
            param: "email",
            msg: "Code does not match. Try Again !",
            value: email
          }
        ]});
      }
    } else {
      callback({status: 'error', errors: [{
          param: "email",
          msg: "Error",
          value: email
        }
      ]});
    }
  });
}
