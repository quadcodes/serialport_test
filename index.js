var express = require('express')
var app = express()
var io = require('socket.io');
var serv_io = io.listen(3300);
var fs = require('fs')
var SerialPort = require("serialport").SerialPort

//Setup the serial port to talk and listen to arduino's
var arduino = new SerialPort("/dev/ttyACM0", {
    baudrate: 9600
})

//Set the ap to serve static files in the folder /public
app.use('/', express.static(__dirname + '/public'))

//Handle all WEBsocket events
app.get('/commands', function(req, res) {
    res.sendFile(__dirname + '/public/index.html')
    serv_io.on('connection', function(socket) {
        console.log("socket sending data...")
        socket.emit('connected', {
            status: 'OK'
        })

        var buffer = new Buffer(2); //buffer array for led states
        buffer[0] = 0x00 //0 --> off   
        buffer[1] = 0x01 //1 --> on

        arduino.open(function(error) {
            if (error) {
                console.log('failed to open: ' + error);
            } else {
                console.log('port open');
                arduino.on('data', function(data) {
                    // console.log('data received: ' + data);
                    var decoded = arrayBufferTostring(data)
                    socket.emit('sensor', {
                        val: decoded
                    })
                });

                var on = "on%"
                var off = "off%"

                socket.on('coms', function(data) {
                    if (data.ledState == "off") {
                        arduino.write(off)
                    } else if (data.ledState == "on") {
                        arduino.write(on)
                    }
                    console.log("arduino led --> " + data.ledState)
                })
            }
        });

    })
})

function arrayBufferTostring(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

//Listen on port 3000
app.listen(3000, function() {
    console.log("Server running on port 3000")
})
