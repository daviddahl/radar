#! /usr/bin/env node
var _redis = require('redis'),
    knownMacs = process.env.RADAR_MAC_ADDRESSES;

var redis = {
    client: null,
    setStatus: function setStatus (turnOn) {
	this.client.set('system-status', turnOn);
	return;
    }
};

if (process.argv.length) {
    console.info('ARGV: \n', process.argv);
    let possibleMACS = [];

    for (let i = 0; i < process.argv.length; i++) {
	if (process.argv[i].indexOf(':') > -1) {
	    possibleMACS.push(process.argv[i]);
	}
    }

    let macsToCheck = possibleMACS.join(" ");
    console.info(macsToCheck);
    redis.client = _redis.createClient();
    // XXX: validate arp table data a bit more
    storeArpTable(macsToCheck, function (err, reply) {
	if (err) {
	    redis.client.quit();
	    console.error(err);
	    process.exit();
	}
	// Check the data for MACS
	redis.client.get('arpData', function (err, reply) {
	    if (err) {
		redis.client.quit();
		console.error(err);
		process.exit();
	    }
	    if (parseTable(reply)) {
		// we see a MAC
		redis.setStatus(0);
	    } else {
		redis.setStatus(1);
	    }
	    redis.client.quit();
	    process.exit();
	});
    });
} else {
    console.error('No args?!');
    redis.client.quit();
    process.exit();
}

function storeArpTable (arpTableData, callback) {
    if (!arpTableData) {
	return callback('No arp data available');
    }
    redis.client.set('arpData', arpTableData, callback);
}

function parseTable (arpTableData) {
    console.log('knownmacs? ', arpTableData.indexOf(knownMacs));
    return arpTableData.indexOf(knownMacs);
}

process.on('SIGINT', function () {
    try {
	redis.client.quit();
	process.exit();
    } catch (ex) {
	process.exit();
    }
});
