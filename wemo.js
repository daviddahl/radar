var WeMo = require('wemo');

var switchName = process.env.RADAR_SWITCH_NAME; // 'GarageSwitch1';

function getSwitch (action) {
    WeMo.Search(switchName, function(err, device) {
        var wemoSwitch = new WeMo(device.ip, device.port);
        console.log(wemoSwitch);
        if (err) {
            console.error(`Cannot get switch: ${err}`);
            return;
        }
        if (action === 'on') {
            turnOn(wemoSwitch);
        }
        if (action === 'off') {
            turnOff(wemoSwitch);
        }
    });
}

function turnOn (wemoSwitch) {
    wemoSwitch.getBinaryState(function(err, result) {
        console.log(err, result);
        if (err) {
            console.error(err);
        }
        if (parseInt(result) === 0) {
            wemoSwitch.setBinaryState(1, function(err, result) {
                if (err) {
                    console.error(err);
                }
                return console.log('Switch turned on');
            });
        }
        console.log('Switch is on');
    });
}

function turnOff (wemoSwitch) {
    wemoSwitch.getBinaryState(function(err, result) {
        console.log(err, result);
        if (err) {
            console.error(err);
        }
        if (parseInt(result) === 1) {
            wemoSwitch.setBinaryState(0, function(err, result) {
                if (err) {
                    console.error(err);
                }
                return console.log('Switch turned off');
            });
        }
        console.log('Switch is off');
    });
}

// getSwitch('off');

module.exports = getSwitch;
