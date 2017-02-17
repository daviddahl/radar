let Gpio = require('onoff').Gpio,
    pir = new Gpio(4, 'in', 'both'),
    uuidV4 = require('uuid/v4'),
    _redis = require('redis'),
    moment = require('moment-timezone'),
    RADAR_MOTION_LOCATION = process.env.RADAR_MOTION_LOCATION,
    RADAR_TZ = process.env.RADAR_TZ,
    RADAR_BEGIN_AUTO_ON_TIME = process.env.RADAR_BEGIN_AUTO_ON_TIME,
    RADAR_BEGIN_AUTO_OFF_TIME = process.env.RADAR_BEGIN_AUTO_OFF_TIME,
    getLightSwitch = require('./wemo'),
    systemStatus = 1,
    systemStatusOverride = true;


let redis = {
    client: _redis.createClient(),
    recordMotion: function recordMotion (motionRecord) {
        this.client.publish('motion-channel', motionRecord);
    },
    checkStatus: function checkStatus (callback) {
	this.client.get('system-status', function (err, reply) {
	    if (err) {
		return console.error(err);
	    }
	    if (!isNaN(parseInt(reply))) {
		systemStatus = parseInt(reply);
		callback(systemStatus);
	    }
	});
    }
};

function motionWatcher (err, value) {
    // Check if someone is home or it is > 22:00 < 7:00
    let currentTime = moment().tz(RADAR_TZ).format().split("T")[1].split(":");
    // [ '17', '05', '11-05', '00' ]
    let hour = parseInt(currentTime[0]);
    if (hour > parseInt(RADAR_BEGIN_AUTO_ON_TIME) || hour < parseInt(RADAR_BEGIN_AUTO_OFF_TIME)) {
	// override status
	systemStatusOverride = true;
    } else {
	systemStatusOverride = false;
    }
    redis.checkStatus(function (status) {
	if (!status && !systemStatusOverride) {
	    console.info(`${Date.now()}: No motion detected`);
	    return;
	}
	if (!value) {
            return console.info('PIR reset');
	}
	getLightSwitch('on');
	pir.unwatch();
	// Tell redis we have observed motion
	let uuid = uuidV4();
	let record = `${new Date()}|${Date.now()}|Motion observed in ${RADAR_MOTION_LOCATION}|${uuid}`;
	console.info('motion recorded: ', record);
	redis.recordMotion(record);
	pir.watch(motionWatcher);
    });
}

pir.watch(motionWatcher);

process.on('SIGINT', function () {
    pir.unexport();
});
