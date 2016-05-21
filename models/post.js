var
  mongoose          = require('mongoose'),
  // userSchema
  user              = require('./user'),
  Schema            = mongoose.Schema;

var postSchema      = mongoose.Schema({
  price: Number,
  description: String,
  price: Number,
  image_name: String,
  status: Number,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now}
});

// connect with DB
// mongoose.connect('mongodb://127.0.0.1:27017/messenger');
module.exports      = mongoose.model('posts', postSchema);