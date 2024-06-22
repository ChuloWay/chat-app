import { Injectable } from '@nestjs/common';
import { logger } from './winston.config';
import * as moment from 'moment';

@Injectable()
export class LoggerService {
  log(message: string, context?: string) {
    const timestamp = moment().format();
    logger.info(message, { timestamp, context });
  }

  error(message: string, context?: string, additionalInfo?: any) {
    const timestamp = moment().format();
    logger.error(message, { timestamp, context, ...additionalInfo });
  }

  warn(message: string, context?: string) {
    const timestamp = moment().format();
    logger.warn(message, { timestamp, context });
  }

  debug(message: string, context?: string) {
    const timestamp = moment().format();
    logger.debug(message, { timestamp, context });
  }
}
