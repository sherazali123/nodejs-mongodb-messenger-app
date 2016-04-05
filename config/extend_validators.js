// extend express validator
module.exports            = function(app, expressValidator){

  app.use(expressValidator({
    customValidators: {
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
    }
  }));

};
