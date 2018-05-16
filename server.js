var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
var connectedSocketes = [];
 connectedSocketes.lobby = [];
 var roomsArray = { };
 var roomname = 'lobby';
 roomsArray[roomname] = {};
io.on('connection', function(socket){
    var userid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    roomsArray['lobby'][userid] = socket.id;
    io.emit("sockets in lobby", roomsArray);
    if(roomsArray!='') {
        io.emit("server room created", roomsArray);
    }
    
     socket.on('room message', function(data){
       io.sockets.in(data.roomId).emit('chat message', data.message);
    });
    socket.on("create room", function (data) {
        var id = data.roomId;
        socket.join(id);
        socket.emit("show current room", id);
        if(!roomsArray[id]){
            if(roomsArray['lobby'][userid]==socket.id){
                          delete roomsArray['lobby'][userid];
            }
            roomsArray[id] = {};
            roomsArray[id][userid] = socket.id;
        io.emit('server room created', roomsArray);
        }else{
            io.emit('server room created', roomsArray);
        }
     });
     socket.on('disconnect', function(){
       for(key in roomsArray){
        for(roomdata in roomsArray[key]){
             if(roomsArray[key][roomdata]==socket.id){
                delete roomsArray[key][roomdata];
               }
            }
       }
       io.emit("server room created", roomsArray);   
    });
    socket.on("leave", function (data) {
        socket.broadcast.to(data.roomToLeave).emit('chat message', {
            leftstatus:1,
            id:data.id
        });
       var test =  createOrLeaveSocket(roomsArray, data.roomToLeave, data.joinRoomId, userid, data.id);
         socket.leave(data.roomToLeave, function (res) {
             socket.join(data.joinRoomId);
             socket.emit('new room joined', data.joinRoomId);
         })
         io.emit("server room created", roomsArray);
         });
        socket.on("left", function(data) {
            for(key in roomsArray[data.group]){
                   if(roomsArray[data.group][key]==data.id){
                      roomsArray['lobby'][key] = data.id;
                     delete roomsArray[data.group][key];
                   }
                }
                socket.leave(data.group);
                io.emit("server room created", roomsArray);
             });
        
});
function createOrLeaveSocket(roomsArray, leave, join, user, socket){
    if(leave==''){
    if(roomsArray['lobby'][user]==socket){
       delete roomsArray['lobby'][user];
          roomsArray[join][user] = socket;
     }
     return roomsArray;
    }
    else if(leave!=''){
        if(roomsArray[leave][user]==socket){
         delete roomsArray[leave][user];
        roomsArray[join][user] = socket;
        return roomsArray;
    }
}
}
http.listen(3000, function(){
    console.log('listening on *:3000');
});