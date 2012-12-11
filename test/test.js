var Browser = require('zombie');
var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://127.0.0.1:1337';

var options = { transports: ['websocket'], 'force new connection' : true };

var user_one = {'nick': 'Darren'}, user_two = {'nick': 'Jerry'};

describe("Chat Server", function(){
  
  it('Should broadcast a new user when they connect', function(done){
    var client = io.connect(socketURL, options);
    client.on('connect', function(data){
      client.emit('set nick', user_one);
    });

    client.on('broadcast_msg', function(user_nick){
      user_nick.should.be.a('string');
      user_nick.should.equal(user_one.nick + ' is now connected.');
    });
    done();
  });//end should not blow up
  
  it('Should broadcast new users to all users', function(done){
    var client_one = io.connect(socketURL, options);

    client_one.on('connect', function(data){
      client_one.emit('set nick', user_one.nick);

      //connect the second socket
      var client_two = io.connect(socketURL, options);

      client_two.on('connect', function(data){
        client_two.emit('set nick', user_two.nick);
      });

      client_two.on('nick', function(nick){
        nick.should.equal(user_two.nick);
        client_two.disconnect();
      });
    });
    
    var numUsers = 0; 
    client_one.on('new user', function(nick){
      numUsers += 1;

      if(numUsers === 2){
        nick.should.equal(user_two.nick + " has joined.");
        client_one.disconnect();
      }
    });
    done();
  });//end should broadcast new user

  it('should broadcast a message to all users', function(done){
    var client_one = io.connect(socketURL, options);
    var msg = 'hello world';

    client_one.on('connect', function(data){
      client_one.emit('set nick', user_one);
      
      var client_two = io.connect(socketURL, options);
      client_two.on('connect', function(data){
        client_two.emit('set nick', user_two);
        client_two.emit('emit msg', msg);
        client_two.on('broadcast_msg', function(message){
          message.should.equal(user_two.nick + ':' + msg);
        });
      });
    });
    done();
  });//end should broadcast a message to all usersi

  it('should add list items to unordered list in view', function(done){
    var client_one = io.connect(socketURL, options);
    var msg = 'zombie nation'

    client_one.on('connect', function(data){
      client_one.emit('set nick', user_one);

      var client_two = io.connect(socketURL, options);
      client_two.on('connect', function(data){
        client_two.emit('set nick', user_two);
        client_two.emit('emit msg', msg);
        browser = new Browser
        browser.visit(socketURL, function(){
          browser.text('li:first').equals(user_two.nick + ':' + msg + ' must fail');
        });
      });
      done();
    });
  });//client side test: end add list items to unordered list
});//end describe chat server
