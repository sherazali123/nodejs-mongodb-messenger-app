var
  change_password         = require('../auth/change_password'),
  register        = require('../auth/register'),
  login           = require('../auth/login'),
  dateFormat      = require('dateformat'),
  user_controller  = require('../apis/users');


module.exports      = function(app){

  app.get('/', function(req,res){
    res.end("NodeJS-WebApis-Started");
  });

  app.post('/login', function(req, res){
    console.log(req);
    req.checkBody("email", "Enter a valid email address.").isEmail();
    req.checkBody("password", "Enter a password.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        email     = req.body.email,
        password  = req.body.password;
      login.login(email, password, function(found){
        console.log(found);
        res.json(found);
      });
    }
  });

  app.post('/register', function(req, res){

    req.checkBody("email", "Enter a valid email address.").isEmail();
    req.checkBody("password", "Enter a valid password.").notEmpty();
    req.checkBody("phone_no", "Enter a phone no.").notEmpty();
    req.checkBody("dob", "Enter valid date of birth.").isValidDob();
    req.checkBody("gender", "Enter a genger (male, female or other).").isValidGender();
    req.checkBody("display_name", "Enter a display name.").notEmpty();
    req.assert('confirm_password', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        email             = req.body.email,
        password          = req.body.password;
        gender            = req.body.gender,
        display_name      = req.body.display_name,
        phone_no          = req.body.phone_no,
        dob               = req.body.dob,
        mood              = req.body.mood ? req.body.mood : '',
        status            = 1;
      register.register(email, password, gender, display_name, phone_no, dob, mood, status, function(found){
        console.log(found);
        res.json(found);
      });
    }


  });

  app.post('/api/change_password', function(req, res){
    var
      token                  = req.body.token,
      old_password           = req.body.old_password,
      new_password           = req.body.new_password,
      confirm_new_password   = req.body.confirm_new_password;
    change_password.change_password(token, old_password, new_password, confirm_new_password, function(found){
      console.log(found);
      res.json(found);
    });
  });

  app.post('/api/reset-password', function(req, res){
    req.checkBody("email", "Enter a valid email address.").isEmail();
    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        email                 = req.body.email;
      change_password.reset_password_init(email, function(found){
        console.log(found);
        res.json(found);
      });
    }

  });

  app.post('/api/reset-password/change', function(req, res){

    req.checkBody("email", "Enter a valid email address.").isEmail();
    req.checkBody("code", "Enter a code from your email.").notEmpty();
    req.checkBody("new_password", "Enter a valid password.").notEmpty();
    req.assert('confirm_new_password', 'Passwords do not match').equals(req.body.new_password);

    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        email                         = req.body.email,
        code                          = req.body.code,
        new_password                  = req.body.new_password,
        confirm_new_password          = req.body.confirm_new_password;

      change_password.reset_password_change(email, code, new_password, function(found){
        console.log(found);
        res.json(found);
      });
    }


  });

  /************ token specific routes start ***************/
  // user

  app.get('/user', function(req, res){

    req.checkHeaders("token", "Token is missing.").notEmpty();
    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});
    } else {
      var
        token = req.headers.token;
      user_controller.show(token, function(found){
        console.log(found);
        res.json(found);
      });
    }

  });

  app.put('/user', function(req, res){
    req.checkHeaders("token", "Token is missing.").notEmpty();
    req.checkBody("type", "Update type is missing or invalid.").isIn(['display_name', 'mood', 'phone_no']);



    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        type                    = req.body.type;

      req.checkBody(type, "Missing").notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        res.send({status: 'error', errors: errors});
        return;
      } else {
        var
          value                   = req.body[type];
          token                   = req.headers.token;

        user_controller.update(token, type, value, function(found){
          console.log(found);
          res.json(found);
        });
      }


    }


  });

  /************ token specific routes end ****************/
};
