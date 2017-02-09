let Gpio = require('onoff').Gpio,
    pir = new Gpio(4, 'in', 'both'),
    uuidV4 = require('uuid/v4'),
    _redis = require('redis'),
    RADAR_MOTION_LOCATION = process.env.RADAR_MOTION_LOCATION,
    getLightSwitch = require('./wemo');;


let redis = {
    client: _redis.createClient(),
    recordMotion: function recordMotion (motionRecord) {
        this.client.publish('motion-channel', motionRecord);
    }
};

function motionWatcher (err, value) {
    // debugger;
    if (!value) {
        return console.info('PIR reset');
    }
    getLightSwitch('on');
    pir.unwatch();
    // Tell redis we have observed motion
    let uuid = uuidV4();
    let record = `${new Date()}|${Date.now()}|Motion observed in ${RADAR_MOTION_LOCATION}|${uuid}`;
    redis.recordMotion(record);
    console.info('motion recorded');
    pir.watch(motionWatcher);
}

pir.watch(motionWatcher);

process.on('SIGINT', function () {
    pir.unexport();
});
