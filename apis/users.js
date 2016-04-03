var
  user        = require('../models/user');

exports.show = function(token, callback){
  user.find({token: token}, function(err, users){
    var
      len = users.length;

    if(len !== 0){
      var found = users[0];
      callback({status: 'success', msg: 'User found.', user: {
        email: found.email,
        gender: found.gender,
        token: token,
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

exports.update = function(token, callback){

};

exports.delete = function(token, callback){

};
