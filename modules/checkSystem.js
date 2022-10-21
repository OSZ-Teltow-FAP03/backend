const schedule = require('node-schedule');

const [ major, minor ] = process.versions.node.split('.').map(parseFloat);
if (major < 14 || (major === 14 && minor <= 0)) {
	console.log('Please go to nodejs.org and download version 8 or greater. 👌\n ');
	process.exit();
}
// const job = schedule.scheduleJob('00 00 12 * * 0-6', function() {
// 	console.log('The answer to life, the universe, and everything!');
// });
