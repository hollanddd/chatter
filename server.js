//require dependencies
var app = require('http').createServer(handler),
    fs = require('fs'),
    io = require('socket.io').listen(app);

app.listen(1337)

//create handler to pass to createServer
function handler(req, res){
  fs.readFile('./client.html', function(err, content){
    if(err){
      res.writeHead(500);
      res.end();
    }
    else{
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(content, 'utf-8');
    }
  });
}


//creating websocket
io.sockets.on( 'connection', function(socket){
  
  //feature: set nickname
  socket.on('set nick', function(nick){
    //Save nickname variable
    socket.set('nick', nick, function(){
      if(nick != null || nick != ''){
        var connected_msg = nick + ' is now connected.';
        console.log(connected_msg);

        io.sockets.volatile.emit('broadcast_msg', connected_msg);
      }
      else{
        //need better error handling instead of blowing up. Inform the user. 
        throw new Error('no name given');
      }
    });
  });

  //feature: emit chat message
  socket.on('emit msg', function(msg){
    //get the nick variable to identify who said what
    socket.get('nick', function(err, nick){
      console.log('Chat message sent by:', nick);
      io.sockets.volatile.emit('broadcast_msg', nick + ': ' + msg );
    });
  });

  //feature: disconnection
  socket.on('disconnect', function(){
    socket.get('nick', function(err, nick){
      console.log('Session left by', nick);
      var disconnected_msg = "<b>" + nick + " has left the chat</b>";

      //broadcast message to all
      io.sockets.volatile.emit('broadcast_msg', disconnected_msg);
    });
  });

  //feature: creep
});
