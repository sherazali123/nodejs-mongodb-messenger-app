var
  mongoose            = require('mongoose'),
  Schema              = mongoose.Schema,
  // userSchema
  user                = require('./user'),
  // postSchema
  post                = require('./post'),
  // https://www.npmjs.com/package/mongoose-validator
  validate        = require('mongoose-validator');

var postCommentSchema    = mongoose.Schema({
    comment: String,
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'post' },
    status: Number,
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now}
});

// collection
module.exports       = mongoose.model('post_comments', postCommentSchema);
