var
  user            = require('../models/user'),
  dateFormat      = require('dateformat');

exports.show = function(token, callback){
  user.findOne({token: token}, function(err, user){

    if(user){
      callback({status: 'success', msg: 'User found.', user: {
        email: user.email,
        gender: user.gender,
        token: token,
        display_name: user.display_name,
        phone_no: user.phone_no,
        dob: dateFormat(user.dob, "yyyy/mm/dd"),
        mood: user.mood,
        status: user.status
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

exports.index = function(token, callback){

};

exports.create = function(email, password, gender, callback){

};

exports.update = function(token, display_name, phone_no, dob, mood, callback){
  user.findOne({token: token}, function(err, user){

    if(user){
      user.display_name         = display_name;
      user.phone_no             = phone_no;
      user.mood                 = mood;
      user.dob                  = dob;
      user.save();
      callback({status: 'success', msg: 'User updated.', user: {
        email: user.email,
        gender: user.gender,
        token: token,
        display_name: user.display_name,
        phone_no: user.phone_no,
        dob: dateFormat(user.dob, "yyyy/mm/dd"),
        mood: user.mood,
        status: user.status
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
