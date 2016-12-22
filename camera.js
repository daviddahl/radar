let RaspiCam = require('raspicam'),
    uuidV4 = require('uuid/v4'),
    RADAR_IMAGE_LOCAL_PATH = process.env.RADAR_IMAGE_LOCAL_PATH,
    _redis = require('redis');

let redis = {
    client: _redis.createClient()
}

redis.client.on('ready', function () {
    redis.client.subscribe('motion-channel');
});

redis.client.on('message', function (channel, message) {
    console.log('CAMERA: client channel ' + channel + ': ' + message);
    message = ' ' + message;
    // take a picture if more than 3 seconds has gone by, then back off
    let uuid = message.split('|')[3];
    
    Camera({uuid: uuid}, function (err, filename) {
        if (err) {
            return redis.client.set('error', err, _redis.print);
        }
        console.info('Photo Saved:', message, filename);
    });
});

function Camera (config, callback) {
    var camera = new RaspiCam({
	mode: "photo",
	output: `${RADAR_IMAGE_LOCAL_PATH}/image-${config.uuid || uuidV4()}.jpg`,
	encoding: config.encoding || "jpg",
	timeout: config.tomeout || 2,
	w: config.w || 640,
	h: config.h || 480
    }),
	fileName;

    function reportError (err, callback) {
	if (err) {
	    if (typeof callback === 'function') {
		return callback(err);
	    }
	    return console.error(err);
	}
    }
    
    camera.on("start", function(err, timestamp) {
	if (err) {
	    console.error(err);
	    reportError(err, callback);
	}
        console.log("photo started at " + timestamp );
    });
    
    camera.on("read", function(err, timestamp, filename) {
	if (err) {
            console.error(err);
	    reportError(err, callback);
	}
	if (filename.indexOf('~') > -1) {
            // Rename operation hoses the file capture!
            return;
	}
        console.log("photo image captured with filename: " + filename);
	fileName = filename;
    });
    
    camera.on("exit", function(timestamp) {
	console.log("photo child process has exited at " + timestamp);
	if (typeof callback === 'function') {
	    callback(null, fileName);
	}
    });

    camera.start();
}
