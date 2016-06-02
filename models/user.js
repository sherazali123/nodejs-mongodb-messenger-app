var
    mongoose        = require('mongoose'),
    Schema          = mongoose.Schema,
    // https://www.npmjs.com/package/mongoose-validator
    validate        = require('mongoose-validator');

var userSchema      = mongoose.Schema({
  token: String,
  email: String,
  hashed_password: String,
  gender: String,
  salt: String,
  temp_str: String,
  status: Number,
  display_name: String,
  dob: { type: Date, default: Date.now },
  phone_no: String,
  mood: String
});

// connect with DB
mongoose.connect('mongodb://127.0.0.1:27017/messenger');
module.exports      = mongoose.model('users', userSchema);
