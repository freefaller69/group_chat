module.exports = function Route(app, server){
  // get socket.io
  var io = require('socket.io').listen(server);
  var moment = require('moment');
  app.get('/', function(req, res){
    res.render('index');
  });
  var session_users = [];
  var chat_history = [];
  function xTime(){
    var logTime = moment().format('h:mm a');
    return logTime;
  }
  function xDate(){
    var logDate = moment().format('MM/DD/YY');
    return logDate;
  }
  //listen to connection from client
  io.sockets.on('connection', function(socket){
    socket.emit("get_user_name");
    console.log('user connected ' + socket.id);

    // events for server to listen for
    // log new user into session array and broadcast to group
    socket.on('new_user', function(user){
      socket.user = user;
      user.id = socket.id;
      user.timeStamp = xTime();
      session_users.push(user);
      socket.broadcast.emit("user_joined", user);
    });
    // user disconnect, broadcast to other users, remove from session_users array
    socket.on('disconnect', function(user){
      user = socket.user;
      user.timeStamp = xTime();
      console.log('user disconnected ' + user.user);
      socket.broadcast.emit("user_disconnected", user);
      var mark = session_users.indexOf(user);
      session_users.splice(mark, 1);
      if(session_users.length === 0){
        chat_history = [];
      }
    });
    socket.on('send_text', function(message){
      message.datestamp = xDate();
      message.timestamp = xTime();
      chat_history.push(message);
      io.emit('new_message', message );
    });

    socket.on("userJoin", function(){
      socket.emit("load_chat_history", chat_history);
    });

  });
};
