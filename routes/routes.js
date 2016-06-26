var
  // file managing change password functions
  change_password         = require('../auth/change_password'),
  // file managing registration functions
  register                = require('../auth/register'),
  // file managing login functions
  login                   = require('../auth/login'),
  // module to manipulate dates
  dateFormat              = require('dateformat'),
  // user actions
  user_controller         = require('../apis/users'),
  // post actions
  post_controller         = require('../apis/posts'),
  // post like actions
  post_like_controller    = require('../apis/post_likes'),
  // post comment actions
  post_comment_controller = require('../apis/post_comments'),
  // user follower/following actions
  user_follower_controller = require('../apis/user_followers');

// exporting all the end points into the application
module.exports      = function(app, express){
  // fake the url by /static which is pointing to the directory public
  app.use('/static', express.static('public'));

  // the root of the application
  app.get('/', function(req,res){
    // returning a simple text as response
    res.end("NodeJS-WebApis-Started");
  });

  // Signing in the user with the required credentials
  app.post('/login', function(req, res){
    // email of the user
    req.checkBody("email", "Enter a valid email address.").isEmail();
    // the password of the user
    req.checkBody("password", "Enter a password.").notEmpty();

    var errors = req.validationErrors();
    if (errors) {
      // return errors if found any error in the request
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        email     = req.body.email,
        password  = req.body.password;
      // login with the given credentials (email, password)
      login.login(email, password, function(found){
        console.log(found);
        res.json(found);
      });
    }
  });

  // registering a new user with params like email, password, phone_no etc etc
  app.post('/register', function(req, res){

    req.checkBody("email", "Enter a valid email address.").isEmail();
    req.checkBody("password", "Enter a valid password.").notEmpty();
    req.checkBody("phone_no", "Enter a phone no.").notEmpty();
    req.checkBody("dob", "Enter valid date of birth.").isValidDob();
    req.checkBody("gender", "Enter a genger (male, female or other).").isIn(['male', 'female', 'other']);
    req.checkBody("display_name", "Enter a display name.").notEmpty();
    req.assert('confirm_password', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        email             = req.body.email,
        password          = req.body.password;
        gender            = req.body.gender,
        display_name      = req.body.display_name,
        phone_no          = req.body.phone_no,
        dob               = req.body.dob,
        mood              = req.body.mood ? req.body.mood : '',
        status            = 1;
      register.register(email, password, gender, display_name, phone_no, dob, mood, status, function(found){
        console.log(found);
        res.json(found);
      });
    }


  });

  // Logged in user can change the password by authorising the old password
  app.post('/api/change_password', function(req, res){

    req.checkHeaders('token', 'Token is missing.').notEmpty();
    req.checkBody('old_password', 'Enter an old password.').notEmpty();
    req.checkBody('new_password', 'Enter a new password').notEmpty();
    req.assert('confirm_new_password', 'Passwords do not match.').equals(req.body.new_password);

    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', error: errors});
      return;
    } else {
      var
        token                  = req.body.token,
        old_password           = req.body.old_password,
        new_password           = req.body.new_password,
        confirm_new_password   = req.body.confirm_new_password;
      change_password.change_password(token, old_password, new_password, confirm_new_password, function(found){
        console.log(found);
        res.json(found);
      });
    }

  });

  // An end point requires email to sent user an email for a code which is used to authenticate user and let me change the password
  app.post('/api/reset-password', function(req, res){
    req.checkBody("email", "Enter a valid email address.").isEmail();
    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        email                 = req.body.email;
      change_password.reset_password_init(email, function(found){
        console.log(found);
        res.json(found);
      });
    }

  });

  // An end point requires code from the email to change the password with ofcourse new password
  app.post('/api/reset-password/change', function(req, res){

    req.checkBody("email", "Enter a valid email address.").isEmail();
    req.checkBody("code", "Enter a code from your email.").notEmpty();
    req.checkBody("new_password", "Enter a valid password.").notEmpty();
    req.assert('confirm_new_password', 'Passwords do not match').equals(req.body.new_password);

    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        email                         = req.body.email,
        code                          = req.body.code,
        new_password                  = req.body.new_password,
        confirm_new_password          = req.body.confirm_new_password;

      change_password.reset_password_change(email, code, new_password, function(found){
        console.log(found);
        res.json(found);
      });
    }

  });

  /************ token specific routes start ***************/

  /************************ USER *************************/

  // An end point return user based on the token lies in header of the request
  app.get('/user', function(req, res){

    req.checkHeaders("token", "Token is missing.").notEmpty();
    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});
    } else {
      var
        token = req.headers.token;
      user_controller.show(token, function(found){
        console.log(found);
        res.json(found);
      });
    }

  });

  // an end point helps us to update some properties of user
  app.put('/user', function(req, res){
    req.checkHeaders("token", "Token is missing.").notEmpty();
    req.checkBody("type", "Update type is missing or invalid.").isIn(['display_name', 'mood', 'phone_no']);

    var errors = req.validationErrors();
    if (errors) {
      res.send({status: 'error', errors: errors});
      return;
    } else {
      var
        type                    = req.body.type;

      req.checkBody(type, "Missing").notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        res.send({status: 'error', errors: errors});return;
      } else {
        var
          value                   = req.body[type];
          token                   = req.headers.token;

        user_controller.update(token, type, value, function(found){
          console.log(found);
          res.json(found);
        });
      }


    }


  });

  // send the data of user (basic, follower, following, posts. likes etc)
  app.get('/user-profile/:user_id', function(req, res){

    req.checkHeaders("token", "Token is missing.").notEmpty();
    req.checkParams("user_id", "user_id is missing").notEmpty();
    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});
    } else {
      var
        token       = req.headers.token,
        user_id     = req.params.user_id;

      user_controller.user_profile(token, user_id, function(found){
        console.log(found);
        res.json(found);
      });
    }

  });

  /******************Followers/Followings*****************/

  // An end point returns posts list with all properties
  app.get('/user/followers/:user_id', function(req, res){
    req.checkHeaders("token", "Token is missing/invalid.").notEmpty();
    req.checkParams("user_id", "user_id is missing").notEmpty();
    req.checkQuery("page", "Invalid page no.").isValidPageNo();
    req.checkQuery("page_size", "Invalid page size.").isValidPageSize();

    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});
    } else {
      var
        token                 = req.headers.token,
        user_id               = req.params.user_id,
        page                  = req.query.page,
        page_size             = req.query.page_size;

      user_follower_controller.followers(token, user_id, page, page_size, function(found){
        console.log(found);
        res.json(found);
      });
    }
  });

  // An end point returns posts list with all properties
  app.get('/user/followings/:user_id', function(req, res){
    req.checkHeaders("token", "Token is missing/invalid.").notEmpty();
    req.checkParams("user_id", "user_id is missing").notEmpty();
    req.checkQuery("page", "Invalid page no.").isValidPageNo();
    req.checkQuery("page_size", "Invalid page size.").isValidPageSize();

    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});
    } else {
      var
        token                 = req.headers.token,
        user_id               = req.params.user_id,
        page                  = req.query.page,
        page_size             = req.query.page_size;

      user_follower_controller.followings(token, user_id, page, page_size, function(found){
        console.log(found);
        res.json(found);
      });
    }
  });

  /************************ POST *************************/

  // An end point returns post properties by the post id
  app.get('/post/:post_id', function(req, res){
    req.checkHeaders("token", "Token is missing/invalid.").notEmpty();
    req.checkParams("post_id", "Post id is missing").notEmpty();

    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});
    } else {
      var
        token                 = req.headers.token,
        post_id               = req.params.post_id;

      post_controller.show(token, post_id, function(found){
        console.log(found);
        res.json(found);
      });
    }
  });

  // An end point returns posts list with all properties
  app.get('/post', function(req, res){
    req.checkHeaders("token", "Token is missing/invalid.").notEmpty();
    req.checkQuery("page", "Invalid page no.").isValidPageNo();
    req.checkQuery("page_size", "Invalid page size.").isValidPageSize();

    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});
    } else {
      var
        token                 = req.headers.token,
        page                  = req.query.page,
        page_size             = req.query.page_size;

      post_controller.index(token, page, page_size, function(found){
        console.log(found);
        res.json(found);
      });
    }
  });

  // An end point creates a new post and return the created post
  app.post('/post', function(req, res){
    req.checkHeaders("token", "Token is missing/invalid.").notEmpty();
    req.checkBody("base64", "Base 64 string is missing.").notEmpty();
    req.checkBody("extention", "Image extention is missing").isIn(['png','jpeg', 'jpg', 'gif', 'PNG', 'JPEG', 'JPG', 'GIF']);
    req.checkBody("price", "Price is missing or invalid value").isNumeric();

    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});return;
    } else {
      var
        token                 = req.headers.token,
        base64                = req.body.base64,
        extention             = req.body.extention,
        price                 = req.body.price,
        description           = req.body.description,
        status                = 1;

        // lower case the extension e.g. PNG to png
      extention = extention.toLowerCase();
      // create post
      post_controller.create(token, base64, extention, price, description, status, function(found){
        console.log(found);
        res.json(found);
      });

    }
  });

  // an end point to like or dis like the post
  app.post('/post/like', function(req, res){
    //token form the header
    req.checkHeaders("token", "Token is missing/invalid.").notEmpty();
    // check if the user liked the post or disliked
    req.checkBody("is_liked", "is_liked is missing.").isIn([0,1]);
    // the post being liked or disliked
    req.checkBody("post_id", "Post id is missing").notEmpty();
    // see if there is any error in the request
    var errors = req.validationErrors();

    if(errors){
      // return errors for the sent request
      res.send({status: 'error', errors: errors});return;
    } else {
      var
        // token from the header
        token                 = req.headers.token,
        // check if the user liked the post or disliked
        is_liked              = req.body.is_liked,
        // the post being liked or disliked
        post_id               = req.body.post_id,
        // as status the state of the post deleted / active / blocked
        status                = 1;
      // convert is_like to Boolean
      is_liked = parseInt(is_liked);
      // is_liked = Boolean(is_liked);

      // create post
      post_like_controller.create(token, is_liked, post_id, status, function(found){
        console.log(found);
        res.json(found);
      });

    }

  });

  // get post commets

  app.get('/post/comment/:post_id', function(req, res){
    // token from the header represents the user
    req.checkHeaders("token", "Token is missing/invalid.").notEmpty();
    // the post id by a certain user
    req.checkParams("post_id", "Post id is missing").notEmpty();
    req.checkQuery("page", "Invalid page no.").isValidPageNo();
    req.checkQuery("page_size", "Invalid page size.").isValidPageSize();

    var errors = req.validationErrors();

    if(errors){
      // return errors as array if request is not correct or complete
      res.send({status: 'error', errors: errors});return;
    } else {
      var
        // token from the header represents the user
        token                 = req.headers.token,
        // the post id by a certain user
        post_id               = req.params.post_id,
        page                  = req.query.page,
        page_size             = req.query.page_size;
      // create post
      post_comment_controller.index(token, post_id, page, page_size, function(found){
        console.log(found);
        res.json(found);
      });

    }


  });

  // create comment
  app.post('/post/comment', function(req, res){
    // token from the header represents the user
    req.checkHeaders("token", "Token is missing/invalid.").notEmpty();
    // the comment itself will be a plain text
    req.checkBody("comment", "Comment is missing.").notEmpty();
    // the comment id on a certain post
    req.checkBody("post_id", "Post id is missing").notEmpty();

    var errors = req.validationErrors();

    if(errors){
      // return errors as array if request is not correct or complete
      res.send({status: 'error', errors: errors});return;
    } else {
      var
        // token from the header represents the user
        token                 = req.headers.token,
        // the comment itself will be a plain text
        comment               = req.body.comment,
        // the comment id on a certain post
        post_id               = req.body.post_id,
        // as status the state of the post comment deleted / active / blocked
        status                = 1;
      // create post
      post_comment_controller.create(token, comment, post_id, status, function(found){
        console.log(found);
        res.json(found);
      });

    }

  });

  // update comment
  app.put('/post/comment', function(req, res){
    // token from the header represents the user
    req.checkHeaders("token", "Token is missing/invalid.").notEmpty();
    // the comment id on a certain post
    req.checkBody("post_comment_id", "Post comment id is missing").notEmpty();
    // the comment itself will be plain text
    req.checkBody("comment", "Comment is missing.").notEmpty();
    // post on the user is commenting
    req.checkBody("post_id", "Post id is missing").notEmpty();
    // see if there is any errors
    var errors = req.validationErrors();

    if(errors){
      // return errors as array if request is not correct or complete
      res.send({status: 'error', errors: errors});return;
    } else {
      var
        // token from the header
        token                 = req.headers.token,
        // the comment itself will be a plain text
        comment               = req.body.comment,
        // the post id on user is commenting
        post_id               = req.body.post_id,
        // the comment id on a certain post
        post_comment_id       = req.body.post_comment_id,
        // as status the state of the post comment deleted / active / blocked
        status                = 1;
      // create post
      post_comment_controller.update(token, comment, post_id, post_comment_id, status, function(found){
        console.log(found);
        res.json(found);
      });

    }

  });
  /*********************following/follower****************/
  // follow or unfollow
  app.post('/follow/:user_id', function(req, res){

    req.checkHeaders("token", "Token is missing.").notEmpty();
    req.checkParams("user_id", "user_id is missing").notEmpty();
    req.checkBody("is_following", "is_following is missing").isIn([0,1]);

    var errors = req.validationErrors();
    if(errors){
      res.send({status: 'error', errors: errors});
    } else {
      var
        // who is going to follow or un follow
        token           = req.headers.token,
        // user who is going to be followed or unfollowed
        user_id         = req.params.user_id,
        // following or unfollowing?
        is_following    = req.body.is_following,

        status          = 1;
      is_following = parseInt(is_following);
      is_following = Boolean(is_following);

      status = (is_following === false ? 0 : 1);

      user_follower_controller.follow_or_unfollow(token, user_id, is_following, status, function(found){
        console.log(found);
        res.json(found);
      });
    }

  });

  /************ token specific routes end ****************/
};
