const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new CloudWatchTransport({
      logGroupName: process.env.CW_LOG_GROUP,
      logStreamName: `backend-${new Date().toISOString().slice(0,10)}`,
      awsRegion: process.env.AWS_REGION
    })
  ]
});

module.exports = logger;