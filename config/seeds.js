require('dotenv').config();

var mongoose = require('./database');
var User     = require( '../models/user' );
var Post     = require('../models/post');

var posts = [
  {
    company          : 'Twitter',
    content          : 'I had a great interview with them last fall, even though I didn\'t end up the taking the job',
    interviewed      : true,
    positive_exp     : true,
    bonus_tips       : 'They really like creativity',
    replies          : []
  },
  {
    company          : 'SnapChat',
    content          : 'I did not have a good experience. Probably because when they asked what I could bring to the table, I told them I just need to make a select all feature and I would go down in history. I did not get called back after that statement',
    interviewed      : true,
    positive_exp     : false,
    bonus_tips       : 'Do not suggest the select all feature',
    replies          : ['I agree']
  },
  {
    company          : 'CornerStone OnDemand',
    content          : 'Their software is kind of boring, but they seem like a really cool company. I would love to hear from anyone who has interviewed with them',
    interviewed      : false,
    positive_exp     : true,
    bonus_tips       : 'Pet friendly office!!!',
    replies          : ['I interviewed last year, I\'d love to chat about it some time', 'I had a disastrous interview there; my interviewer did not have a sense of humor']
  }
];

// function that actually talks to the db and seeds it
// User.remove({}, function(err) {
//   if (err) console.log(err);
//   User.create(users, function(err, users) {
//     if (err) {
//       console.log(err);
//     } else {
//       console.log("Database seeded with " + users.length  + " users.");
//       mongoose.connection.close();
//     }
//     process.exit();
//   });
// });

Post.remove({}, function(err) {
  if (err) console.log(err);
  Post.create(posts, function(err, posts) {
    if (err) {
      console.log(err);
    } else {
      console.log("Database seeded with " + posts.length  + " posts.");
      mongoose.disconnect();
    }
  });
});
