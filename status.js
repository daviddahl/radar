#! /usr/bin/env node
var yargs = require('yargs').argv,
    _redis = require('redis'),
    knownMacs = process.env.RADAR_MAC_ADDRESSES;

var redis = {
    client: null,
    setStatus: function setStatus (turnOn) {
        this.client = _redis.createClient()
	this.client.set('system-status', turnOn);
	this.client.quit();
	return;
    }
};

redis.client;

if (yargs._[0]) {
    if(parseTable(yargs._[0]) > -1) {
	return updateStatus(true);
    }
    updateStatus(false);
} else {
    console.error('No MACS');
    process.exit();
}

function parseTable (arpTable) {
    console.log('knownmacs? ', arpTable.indexOf(knownMacs));
    return arpTable.indexOf(knownMacs);
}

function updateStatus (turnOn) {
    console.log('call redis, set on or off');
    debugger;
    if (turnOn) {
        return redis.setStatus(1);
    } else {
	return redis.setStatus(0);
    }
    process.exit();
}
