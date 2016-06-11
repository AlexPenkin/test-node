 var socket = io();
 console.log("Connected");
 $('*').on( "submit", (function(){
    console.log("Отправлено");
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  }));
  socket.on('chat message', function(msg){
      console.log("Принято");
    $('#messages').append($('<li>').text($.cookie("name") + " пишет: " + msg));
  });

  socket.on('user connected', function(msg){
      console.log(msg);
      if ($.cookie("name") != undefined) {
    $('#messages').append($('<li>').text($.cookie("name") + " Connected"));
  } else {
      $('#messages').append($('<li>').text("Guest Connected"));
  }
  });
   
