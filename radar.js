let Gpio = require('onoff').Gpio,
    RaspiCam = require('raspicam'),
    pir = new Gpio(4, 'in', 'both'),
    https = require('https'),
    FROM_PHONE_NUMBER = process.env.RADAR_TWILIO_FROM_PHONE_NUMBER,
    TO_PHONE_NUMBER = process.env.RADAR_TWILIO_TO_PHONE_NUMBER,
    accountSid = process.env.RADAR_TWILIO_ACCOUNTSID,
    authToken = process.env.RADAR_TWILIO_AUTHTOKEN,
    mediaUrl = `${process.env.RADAR_HTTP_PROTO}${process.env.RADAR_HTTP_HOST}/`,
    client = require('twilio')(accountSid, authToken),
    uuidV4 = require('uuid/v4');

function motionWatcher (err, value) {
    let fileName;

    if (err) {
        console.error(err);
        // SEND Err SMS
        notifyFault(err);
        throw err;
    }

    pir.unwatch();

    console.info(`Motion detected... ${value}`);

    var camera = new RaspiCam({
        mode: "photo",
        output: `/var/www/html/pi-photos/image-${uuidV4()}.jpg`,
        encoding: "jpg",
        timeout: 2,
        w: 640,
        h: 480
    });

    camera.on("start", function( err, timestamp ){
        console.log("photo started at " + timestamp );
    });

    camera.on("read", function( err, timestamp, filename ) {
        console.log("photo image captured with filename: " + filename );
        if (filename.indexOf('~') > -1) {
            // Fucking rename operation hoses the MMS file capture!
            return;
        }
        fileName = filename;
        notify(fileName);
    });

    camera.on("exit", function( timestamp ){
        console.log("photo child process has exited at " + timestamp );
    });
    camera.start();
}

function notify (fileName) {
    client.messages.post({
        to: TO_PHONE_NUMBER,
        from: FROM_PHONE_NUMBER,
        body: `Motion detected @ ${new Date()}\n${mediaUrl}${fileName}`,
        // mediaUrl: `${mediaUrl}${fileName}` // MMS, but expensive
    }, function (err, message) {
        if (err) {
            return console.error('Cannot send SMS', err);
            pir.watch(motionWatcher);
        }
        console.log(message);
        pir.watch(motionWatcher);
    });
}

function notifyFault (smsMessage) {
    client.messages.post({
        to: TO_PHONE_NUMBER,
        from: FROM_PHONE_NUMBER,
        body: `RADAR ERROR at ${new Date()}: ${smsMessage}`
    }, function (err, message) {
        if (err) {
            return console.error('Cannot send fault SMS', err);
        }
        console.log(message);
        pir.watch(motionWatcher);
    });
}

pir.watch(motionWatcher);

process.on('SIGINT', function () {
    pir.unexport();
});
