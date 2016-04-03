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
        email     = req.body.email,
        password  = req.body.password;
        gender  = req.body.gender;
      register.register(email, password, gender, function(found){
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

  app.get('/user/:token?', function(req, res){

    req.checkParams("token", "Token is missing.").notEmpty();
    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});
    } else {
      var
        token = req.params.token;
      user_controller.show(token, function(found){
        console.log(found);
        res.json(found);
      });
    }

  });

  /************ token specific routes end ****************/
};
