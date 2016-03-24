/*
 * Module dependencies
 */

var express       = require('express'),
    connect       = require('connect'),
    bodyParser    = require('body-parser'),
    validator     = require('express-validator'),
    app           = express(),
    port          = process.env.PORT || 8080;

// Configuration
app.use(express.static(__dirname + '/public'));
// app.use(connect.logger());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(validator());
// Routes
require('./routes/routes.js')(app);
// Listen on the port
app.listen(port);
console.log("The app runs on port " + port);
