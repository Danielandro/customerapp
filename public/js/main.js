$(document).ready(function() {
  $('.deleteUser').on('click', deleteUser); // run below function on click
});

function deleteUser() {
  var confirmation = confirm('Are You Sure?'); // confirmation popup


  if (confirmation){ // send AJAX request - to delete the user
    $.ajax({
      type: 'DELETE',
      url: '/users/delete/' +$(this).data('id') // this = clicked user. Grab the ID of user using data attribute. Url to be used in app.js
    }).done(function(response){
      window.location.replace('/');
    });
    window.location.replace('/'); // returns to homepage

    }
    else {
      return false; // if (!confirmation), then nothing happens
  };

};
