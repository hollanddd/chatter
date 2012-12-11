var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:1337';

var options = { transports: ['websocket'], 'force new connection' : true };

var user1 = {'nick': 'Darren'};
var user2 = {'nick': 'Jerry'};

describe("Chat Server", function(){
  
  it('Should broadcast a new user when they connect', function(done){
    var client = io.connect(socketURL, options);
    client.on('connect', function(data){
      client.emit('set nick', user1);
    });

    client.on('broadcast_msg', function(user_nick){
      user_nick.should.be.a('string');
      user_nick.should.equal(user1.nick + ' is now connected.');
    });
    done();
  });//end should not blow up
  
  it('Should broadcast new users to all users', function(done){
    var socket1 = io.connect(socketURL, options);

    socket1.on('connect', function(data){
      socket1.emit('set nick', user1.nick);

      //connect the second socket
      var socket2 = io.connect(socketURL, options);

      socket2.on('connect', function(data){
        socket2.emit('set nick', user2.nick);
      });

      socket2.on('nick', function(nick){
        nick.should.equal(user2.nick);
        client2.disconnect();
      });
    });
    
    var numUsers = 0; 
    socket1.on('new user', function(nick){
      numUsers += 1;

      if(numUsers === 2){
        nick.should.equal(user2.nick + " has joined.");
        socket1.disconnect();
        done();
      }
    });
    done();
  });//end should broadcast new user 

});//end describe chat server
