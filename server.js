/*
 * Module dependencies
 */

var
  express       = require('express'),
  connect       = require('connect'),
  bodyParser    = require('body-parser'),
  validator     = require('express-validator'),
  app           = express(),
  port          = process.env.PORT || 8080;

// Configuration
app.use(express.static(__dirname + '/public'));
// app.use(connect.logger());


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit:50000 }));

// parse application/json
app.use(bodyParser.json({limit: "50mb"}));

app.use(validator());

// extend validators
require('./config/extend_validators.js')(app, validator);

// Routes
require('./routes/routes.js')(app, express);

// Listen on the port
app.listen(port);
console.log("The app runs on port " + port);
