var app = require('express')();
var http = require('http').Server(app);
//var io = require('socket.io')(http);

app.get('/', function(req, res){

  //send the index.html file for all requests
  res.sendFile(__dirname + '/index.html');

});
http.listen(3000, function(){
  console.log('Server listening on *:3000');

});

var io = require('socket.io').listen(http);


io.on('connection', function(socket) {
    io.emit('conn','Server -> Client Message: Welcome!' );
	
});

var EventHubClient = require('azure-event-hubs').Client;
 
var client = EventHubClient.fromConnectionString('Endpoint=sb://evnthub.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=eJ7XbH8Je+/nGM/TMp715oLzoidqWZxVyyH+mFiCYYk=', 'msg-event-3')
//var EventHubClient = require('azure-event-hubs').Client;
var printError = function (err) {
  console.log(err.message);
};

var printMessage = function (message) {
  console.log('Message received: ');
  console.log(JSON.stringify(message.body));
  io.emit('message','<br>'+ JSON.stringify(message.body) +'</br>');
  console.log('');
};

//var client = EventHubClient.fromConnectionString(connectionString);
client.open()
    .then(client.getPartitionIds.bind(client))
    .then(function (partitionIds) {
        return partitionIds.map(function (partitionId) {
            return client.createReceiver('$Default', partitionId, { 'startAfterTime' : Date.now()}).then(function(receiver) {
                console.log('Created partition receiver: ' + partitionId)
                receiver.on('errorReceived', printError);
                receiver.on('message', printMessage);
				
            });
        });
    })
    .catch(printError);