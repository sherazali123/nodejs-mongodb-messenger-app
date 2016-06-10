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
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    post_id: { type: mongoose.Schema.Types.ObjectId, ref: 'posts' },
    status: Number,
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now}
}, {
  toObject: { virtuals: true},
  toJSON: { virtuals: true }
});

// collection
module.exports       = mongoose.model('post_comments', postCommentSchema);
