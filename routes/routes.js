var
  chgpass         = require('../auth/chgpass'),
  register        = require('../auth/register'),
  login           = require('../auth/login'),
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
    req.checkBody("gender", "Enter a genger (male, female or other).").isValidGender();
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
        display_name      = req.body.display_name ? req.body.display_name : '',
        phone_no          = req.body.phone_no ? req.body.phone_no : '',
        mood              = req.body.mood ? req.body.mood : '',
        status            = 1;
      register.register(email, password, gender, display_name, phone_no, mood, status, function(found){
        console.log(found);
        res.json(found);
      });
    }


  });

  app.post('/api/chgpass', function(req, res){
    var id        = req.body.id;
    var opass     = req.body.oldpass;
    var npass     = req.body.newpass;
    chgpass.cpass(id, opass, npass, function(found){
      console.log(found);
      res.json(found);
    });
  });

  app.post('/api/resetpass', function(req, res){
    var email     = req.body.email;
    chgpass.respass_init(email, function(found){
      console.log(found);
      res.json(found);
    });
  });

  app.post('/api/resetpass/chg', function(req, res){
    var email        = req.body.email;
    var code        = req.body.code;
    var npass        = req.body.newpass;
    chgpass.respass_chg(email, code, npass, function(found){
      console.log(found);
      res.json(found);
    });
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
    req.checkBody("display_name", "Enter a display name.").notEmpty();
    req.checkBody("mood", "Enter a status mood.").notEmpty();
    req.checkBody("phone_no", "Enter a valid phone no.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        display_name            = req.body.display_name,
        mood                    = req.body.mood;
        phone_no                = req.body.phone_no,
        token                   = req.headers.token;

      user_controller.update(token, display_name, phone_no, mood, function(found){
        console.log(found);
        res.json(found);
      });
    }


  });

  /************ token specific routes end ****************/
};
