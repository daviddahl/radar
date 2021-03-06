let child_process = require('child_process');

console.log('Starting motion detection...');
child_process.fork('./motion.js');
console.log('Starting camera daemon...');
child_process.fork('./camera.js');
console.log('Starting sms daemon...');
child_process.fork('./sms.js');

console.log('Radar processes running.');

process.on("uncaughtException", function errorHandler (err) {
    console.error('Uncaught Exception: ', err);
    // this.emit("error:cleanup");
});
