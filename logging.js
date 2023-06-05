const fs = require('fs');
const log4js = require('log4js');

// Create a logs directory if it doesn't exist
const logDirectory = 'logs';
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Configure log4js appenders and categories
log4js.configure({
    appenders: {
        general: { type: 'file', filename: `${logDirectory}/log.txt` },
        error: { type: 'file', filename: `${logDirectory}/error.log` },
    },
    categories: {
        default: { appenders: ['general'], level: 'info' },
        error: { appenders: ['error'], level: 'error' },
    },
});

// Create loggers
const log = log4js.getLogger();
const errorLog = log4js.getLogger('error');

// Export the loggers for usage in other modules
module.exports = {
    log,
    errorLog,
};
