var
  mongoose          = require('mongoose'),
  // userSchema
  user_model        = require('./user'),
  post_like_model   = require('./post_like'),
  post_comment_model   = require('./post_comment'),
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

// make post imeage url using virtual properties
postSchema
.virtual('image_url')
.get(function(){
  return '/static/uploads/posts/' + this.user_id._id + '/' + this.image_name;
});

// returing total no of likes for the post as a callback
postSchema.methods.get_no_of_likes = function(cb){
  post_like_model.find({post_id: this._id, user_id: this.user_id, status: 1}).count(cb);
};
// returing total no of comments for the post as a callback
postSchema.methods.get_no_of_comments = function(cb){
  post_comment_model.find({post_id: this._id, user_id: this.user_id, status: 1}).count(cb);
};
// check if post is liked by user
postSchema.methods.is_liked = function(user_id, cb){
  post_like_model.find({post_id: this._id, user_id: user_id, status: 1}).count(cb);
};


// connect with DB
// mongoose.connect('mongodb://127.0.0.1:27017/messenger');
module.exports      = mongoose.model('posts', postSchema);
