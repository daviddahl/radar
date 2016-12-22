let FROM_PHONE_NUMBER = process.env.RADAR_TWILIO_FROM_PHONE_NUMBER,
    TO_PHONE_NUMBER = process.env.RADAR_TWILIO_TO_PHONE_NUMBER,
    accountSid = process.env.RADAR_TWILIO_ACCOUNTSID,
    authToken = process.env.RADAR_TWILIO_AUTHTOKEN,
    mediaUrl = `${process.env.RADAR_HTTP_PROTO}${process.env.RADAR_HTTP_HOST}/pi-photos/image-`,
    _twilio = require('twilio')(accountSid, authToken),
    _redis = require('redis');

let redis = {
    client: _redis.createClient()
};

redis.client.on('message', function (channel, message) {
    console.log('SMS: client channel ' + channel + ': ' + message);
    notify(message);
    // redis.client.set('motion-channel-sms-sent', `${channel} ${message}`);
});

redis.client.on('ready', function () {
    redis.client.subscribe('motion-channel');
});

function notify (message) {
    console.log('message: ', message);
    let filename = message.split('|')[3];
    _twilio.messages.post({
        to: TO_PHONE_NUMBER,
        from: FROM_PHONE_NUMBER,
        body: `${message} \n${mediaUrl}${filename}.jpg`,
        // mediaUrl: `${mediaUrl}${fileName}` // MMS, but expensive
    }, function (err, message) {
        if (err) {
            return console.error('Cannot send SMS', err);
        }
        console.log(message);
    });
}

