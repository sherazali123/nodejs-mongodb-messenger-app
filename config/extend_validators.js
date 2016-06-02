var
  user                    = require('../models/user');
// extend express validator
module.exports            = function(app, expressValidator){

  app.use(expressValidator({
    customValidators: {
      isValidAuthToken: function(token){
        var found = false;
        if(!token) found = false;
        // check if the token exists in user collection
        user.findOne({token: token, function(err, user){
          found = !user ? false : true;
        }});
        return found;
      },
      isValidGender: function(gender) {
        if(['male', 'female', 'other'].indexOf(gender) !== -1){
          return true;
        }
        return false;
      },
      isValidDob: function(dob) {
        dob = dob || '';
        dob = dob.trim();
        if(dob === ''){
          return false;
        }
        var validate_dob = new Date(dob);
        if(validate_dob == 'Invalid Date'){
          return false;
        }
        return true;
      },
      isValidPageNo: function(page){
        page = page || 1;
        page = parseInt(page);
        if(isNaN(page)) return false;
        if(typeof page !== "number") return false;
        if(page < 1) return false;
        return true;
      },
      isValidPageSize: function(size){
        size = size || 0;
        size = parseInt(size);
        if(isNaN(size)) return false;
        if(typeof size !== "number" || isNaN(size)) return false;
        if(size < 0) return false;
        return true;
      }
    }
  }));

};
