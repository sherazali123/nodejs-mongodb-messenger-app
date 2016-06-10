var
  mongoose          = require('mongoose'),
  // userSchema
  user              = require('./user'),
  Schema            = mongoose.Schema,
  // https://www.npmjs.com/package/mongoose-validator
  validate          = require('mongoose-validator');

var postSchema      = mongoose.Schema({
  price: Number,
  description: String,
  price: Number,
  image_name: String,
  status: Number,
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now}
}, {
  toObject: { virtuals: true},
  toJSON: { virtuals: true }
});

postSchema
.virtual('image_url')
.get(function(){
  return '/static/uploads/posts/' + this.user_id + '/' + this.image_name;
});

// connect with DB
// mongoose.connect('mongodb://127.0.0.1:27017/messenger');
module.exports      = mongoose.model('posts', postSchema);
