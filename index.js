let Gpio = require('onoff').Gpio,
    RaspiCam = require('raspicam'),
    pir = new Gpio(4, 'in', 'both'),
    https = require('https'),
    FROM_PHONE_NUMBER = process.env.RADAR_TWILIO_FROM_PHONE_NUMBER,
    TO_PHONE_NUMBER = process.env.RADAR_TWILIO_TO_PHONE_NUMBER,
    // Twilio Credentials
    accountSid = process.env.RADAR_TWILIO_ACCOUNTSID,
    authToken = process.env.RADAR_TWILIO_AUTHTOKEN,
    mediaUrl = process.env.RADAR_MEDIA_URL,
    //require the Twilio module and create a REST client
    client = require('twilio')(accountSid, authToken);

let sendSMS = true;
let smsCounter = 0;
let ARMED = false;

let lastPhotoTime = null;
let fileName;

// XXX: Log everything to web api. Cloudant?
pir.watch(function (err, value) {
    if (err) {
	console.error(err);
	throw err;
    }
    debugger;
    // XXX: We have a motion event. Take a picture.
    if (value === 1) {
	console.info(`Motion detected... ${value}`);
	if (!lastPhotoTime || (lastPhotoTime < Date.now() - 60)) {
	    // Take picture
	    var camera = new RaspiCam({
		mode: "photo",
		output: "/var/www/html/pi-photos/image-%06d.jpg",
		encoding: "jpg",
		timeout: 0 // take the picture immediately
	    });
	    
	    camera.on("start", function( err, timestamp ){
		console.log("photo started at " + timestamp );
		lastPhotoTime = Date.now();
	    });
	    
	    camera.on("read", function( err, timestamp, filename ){
		console.log("photo image captured with filename: " + filename );
		fileName = filename
		notify();
	    });
	    
	    camera.on("exit", function( timestamp ){
		console.log("photo child process has exited at " + timestamp );
	    });

	    function notify () {
		client.messages.post({
		    to: TO_PHONE_NUMBER,
		    from: FROM_PHONE_NUMBER,
		    body: `Motion detected at ${new Date()}`,
		    mediaUrl: `${mediaUrl}${fileName}`
		}, function (err, message) {
		    if (err) {
			return console.error('Cannot send SMS', err);
		    }
		    console.log(message);
		});
	    }
	    camera.start();
	}
    }
});

process.on('SIGINT', function () {
    pir.unexport();
});
