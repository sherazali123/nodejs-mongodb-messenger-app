// extend express validator
module.exports            = function(app, expressValidator){

  app.use(expressValidator({
    customValidators: {
      isValidGender: function(gender) {
        if(['male', 'female', 'other'].indexOf(gender) !== -1){
          return true;
        }
        return false;
      }
    }
  }));

};
