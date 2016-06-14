var
  mongoose            = require('mongoose'),
  Schema              = mongoose.Schema,
  // userSchema
  user                = require('./user'),
  // https://www.npmjs.com/package/mongoose-validator
  validate        = require('mongoose-validator');

var userFollowerSchema    = mongoose.Schema({
    follower: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    following: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    status: Number,
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now}
}, {
  toObject: { virtuals: true},
  toJSON: { virtuals: true }
});

// collection
module.exports       = mongoose.model('user_followers', userFollowerSchema);
