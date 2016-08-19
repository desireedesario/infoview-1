console.log('app.js loaded');
// var mongoose = require('../database');
// globally define jquery variables to be used later
var $senseiPosts;
var $grasshopperPosts;
var $form;
var $postCompany;
var $interviewed;
var $posExp;
var $bonusTips;
var $postContent;
var $postUser;
var $currentUserId;

// fcn to dynamically create an html representation of the json returned from the json, including view more and delete buttons
function createPostHTML(post) {
  return $('<li id="post-' + post._id +
  '" class="groupList interviewed-' + post.interviewed
  + ' list-group-item"><p>Company: <strong>' + post.company
  + ' </strong></p><br><p> ' + post.content + '</p><br><button type="button" id="' + post._id + '" onClick=showPost(this.id) class="link show-post" data-target="#showModal" data-toggle="modal" data-id="' + post._id + '"> View for more info</button>' + addDeleteButton(post) + '</li><hr style="margin: 5%;"">'
  )
}

// create an HTML version of a reply
function createReplyHTML(reply) {
  return $('<div class="media"><div class="media-left reply-user"><img class="media-object" src="' + reply.postedBy.linkedin.pictureUrl + '"></div><div class="media-body"><h4 class="media-heading"> Reply from: ' + reply.postedBy.linkedin.firstName + '</h4><p>' + reply.text + '</p></div></div>')
}

// go through a post's replies and append them all under the post
function listReplies(post) {
  post.replies.forEach(function(reply) {
    var replyHTML = createReplyHTML(reply);
    $('#post-replies').append(replyHTML);
  })
}

// append a delete button to all posts created by the current user
function addDeleteButton(post) {
  $currentUserId = $('.hidden-id').attr('id');
  if (post.postedBy == $currentUserId) {
    return '<span class="remove-post link" style="float:right;">Delete</span>';
  } else {
    return '';
  }
}

function showPost(post){
  // get a single post from the API
  $.ajax({
    method: 'GET',
    url: 'api/posts/' + encodeURIComponent(post)
  }).then(
    function(jsonPost) {
      console.log(jsonPost)
      var user = jsonPost.postedBy
      $.ajax({
        method: 'GET',
        url: 'api/users/' + user
      }).then(
        function(jsonUser) {
        $('#showModal .modal-content').attr('id', jsonPost._id)
        $('.modal-title').empty();
        // $('.modal-content').eq(0).attr('id') = jsonPost._id;
        $('#showModal .modal-title').append('<p>Post by:</p><h3><a href="' + jsonUser.linkedin.profileUrl + '" target="_blank">' + jsonUser.linkedin.firstName + ' ' + jsonUser.linkedin.lastName + '</a></h3><img src="' + jsonUser.linkedin.pictureUrl + '">');
        $('.modal-post-details').empty();
        $('.modal-post-details').append('<div>company: ' + jsonPost.company + '</div>' +
          '<div>Interviewed or Upcoming Interview : ' + jsonPost.interviewed + '</div>' +
          '<div>(if interviewed) How was your experience? : ' + jsonPost.positive_exp + '</div>' +
          '<div>Interview details: ' + jsonPost.content + '</div>' +
          '<div>Bonus Tips: ' + jsonPost.bonus_tips + '</div><hr><div id="post-replies"></div>'
        );
        // list all the replies for this post
        listReplies(jsonPost);
      })

    }
  )
}

function addReply(postId) {
  $.ajax({
    method: 'PATCH',
    url: 'api/posts/' + encodeURIComponent(postId),
    data: {
      text: $('#reply-content').val(),
      postedBy: $('#reply-user').val()
    }
  }).then(
    function(jsonPost) {
      var replyHTML = createReplyHTML(jsonPost.replies[jsonPost.replies.length-1]);
      $('#post-replies').append(replyHTML);
      $('#reply-content').val('');
    }
  )
}


/////////////////////////////////////////////////
//////////////GET BY ID AND DELETE///////////////
/////////////////////////////////////////////////

// A function that will poull out the id from the li so I don't need to add the id to both the span for the delete and the checkbox for the update.
function getId(jqueryThing) {
  return jqueryThing.attr('id').slice(5);
}

// Define function that will get executed when the X is clicked on.
function deleteHandler(e) {
  console.log('deleteHandler enabled')
  // Grab the parent li of the span
  var html = $(this).parent();
  // Get the id of the todo we are deleting
  var id = getId(html);
  // Use AJAX to delete the todo from our db
  $.ajax({
    type: 'DELETE',
    url: '/api/posts/' + encodeURIComponent(id)
  }).then(
    // Use jquery to remove it from the DOM
    function(jsonPost) {
      html.remove();
    }
  );
}

// wait for the doucment to load before performing the following
$(document).ready(function() {
  // use jquery to grab DOM elements
  $senseiPosts      = $('#sensei-posts');
  $grasshopperPosts = $('#grasshopper-posts');
  $form             = $('#new-post');

  //get all posts in json using ajax
  $.ajax({
    method: 'GET',
    url: '/api/posts'
  }).then(
    // pass it what the ajax req came back with
    function listPosts(jsonPosts) {
      // iterate through our array of posts
      jsonPosts.forEach(function(jsonPost) {
        // convert to html
        var postHTML = createPostHTML(jsonPost);
        // check if post is a completed interview and make it the correct color
        if (jsonPost.interviewed) {
          $senseiPosts.append(postHTML);
        } else {
          $grasshopperPosts.append(postHTML);
        }
      })
    }
  )

  // what to do when submit button on the form is clicked
  $form.on('submit', function(e) {
    // stop the default behavior from clicking on the submit buttton
    e.preventDefault();
    // grab all needed DOM elements
    $postCompany      = $('#post-company');
    $interviewed      = $('input[name=optionsRadios1]:checked');
    $posExp           = $('input[name=optionsRadios2]:checked');
    $bonusTips        = $('#post-bonusTips');
    $postContent      = $('#post-content');
    $postUser         = $('#post-user');
    console.log('post user is: ', $postUser.val());

    // create the new post from the values of the form fields
    var newPost = {
      company      : $postCompany.val(),
      content      : $postContent.val(),
      interviewed  : $interviewed.val(),
      positive_exp : $posExp.val(),
      bonus_tips   : $bonusTips.val(),
      postedBy     : $postUser.val()
    }

    console.log(newPost)

    // use ajax to add the new todo to our db:
    $.ajax({
      method: 'POST',
      url:    '/api/posts',
      data:   newPost
    }).then( // can pass 2 cb's in case of success or failure
      // what to do if ajax request was succesful
      function(jsonPost) {
        // clear the form if successfully saved
        $postCompany.val('');
        $postContent.val('');
        $interviewed.val('');
        $posExp.val('');
        $bonusTips.val('');
        // return new post as json
        return jsonPost;
      },
      // what to do if the request failed
      function(err) {
        console.log('Failed: ', err);
      }
    ).then(
      function(jsonPost) {
        // use previously defined fcn to create an html representation of the post
        var postHTML = createPostHTML(jsonPost);
        // append the html post to the DOM
        if (jsonPost.interviewed) {
          $senseiPosts.append(postHTML);
        } else {
          $grasshopperPosts.append(postHTML);
        }
      }
    )
    // make modal go away on submit
    $('#myModal').modal('toggle');
    return false;

  })

// Attach event listeners through delegation.
 // When a selector is provided(as the second argument, i.e. ':checkbox' or '.remove-item'), the event handler is referred to as delegated. The handler is not called when the event occurs directly on the bound element, but only for descendants (inner elements) that match the selector.
 // delete post buttons
 $senseiPosts.on('click', '.remove-post', deleteHandler);
 $grasshopperPosts.on('click', '.remove-post', deleteHandler);
 // submit reply button
 $('#submit-reply').on('click', function(e) {
   e.preventDefault();
   addReply($(this).parent().parent().parent().attr('id'));
 })
});
