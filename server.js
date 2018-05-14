var config = require('./config');

var app = require('./app');
var http = require('http');



app.set('port', config.port);

var server = http.createServer(app);
server.listen(config.port,function(){
    console.log("app running at port " + config.port);
});
server.on('error', onError);
server.on('listening', onListening);

//Initialize log file (Note : Create if log file does not exists
var fs = require('fs');
fs.stat('error.log', function(err, status) {
    if (err !== null) {
        fs.createWriteStream("error.log");
    }
});

// Event listener for HTTP server "error" event.
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error('Port ' + config.port + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error('Port ' + config.port + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    console.log('Listening on ' + 'Port ' + config.port);
}