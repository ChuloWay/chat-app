import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as SlackHook from 'winston-slack-webhook-transport';
import * as winstonMongoDB from 'winston-mongodb';

// Create transports instance
const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, context, trace, cause }) => {
        // Add a line break before the message and cause if they exist
        const formattedMessage = message ? `\n${message}` : '';
        const formattedCause = cause ? `\nCause: ${cause}` : '';
        return `${timestamp} [${context}] ${level}: ${formattedMessage}${trace ? `\n${trace}` : ''}${formattedCause}`;
      }),
    ),
  }),

  new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),

  new SlackHook({
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    channel: '#logs',
    username: 'LoggerBot',
    level: 'error',
    formatter: (info) => {
      const { level, message, context, method, path, errorName, statusCode, cause } = info;
      return {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*${level.toUpperCase()}*:\n*Error* in ${context}:\n*Message:* ${message}\n*Method:* ${method}\n*Path:* ${path}\n*Error Name:* ${errorName}\n*Status:* ${statusCode}\n*Cause*: ${cause}`,
            },
          },
        ],
      };
    },
  }),

  new winstonMongoDB.MongoDB({
    level: 'info',
    db: process.env.MONGODB_URI,
    options: {
      useUnifiedTopology: true,
    },
    collection: 'logs',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),
];

// Create and export the logger instance
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
});
