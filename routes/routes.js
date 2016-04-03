var chgpass         = require('config/chgpass');
var register        = require('config/register');
var login           = require('config/login');


module.exports      = function(app, expressValidator){

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

  app.get('/', function(req,res){
    res.end("NodeJS-WebApis-Started");
  });

  app.post('/login', function(req, res){
    req.checkBody("email", "Enter a valid email address.").isEmail();
    req.checkBody("password", "Enter a password.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var email     = req.body.email,
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
        gender  = req.body.genger;
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

};
