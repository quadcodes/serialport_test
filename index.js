var SerialPort = require("serialport").SerialPort;
var serialport = new SerialPort("/dev/cu.usbserial-A9E9H3RJ", {
	parser: require("serialport").parsers.readline("\n")
});
//
serialport.on('open', function(){
  console.log('serial port opened');
  serialport.on('data', function(data){
      console.log(data);
  });
});
