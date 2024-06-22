import { Catch, ExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';
import * as moment from 'moment';
import * as Sentry from '@sentry/node';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    Sentry.captureException(exception);

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let responseError: string;
    if ((exception.response && typeof exception.response.message === 'string') || Array.isArray(exception.response.message)) {
      responseError = exception.response.message;
    } else {
      responseError = 'Internal Server Error';
    }

    const devErrorResponse = {
      statusCode: status,
      timestamp: moment().toISOString(),
      path: request.url,
      method: request.method,
      errorName: exception?.name,
      message: responseError,
      cause: exception?.response,
    };

    const prodErrorResponse = {
      statusCode: status,
      message: responseError,
    };

    // Log the exception using LoggerService
    let causeMessage = null;
    if (exception?.response) {
      if (typeof exception.response === 'string') {
        causeMessage = exception.response;
      } else if (typeof exception.response === 'object' && 'message' in exception.response) {
        causeMessage = exception.response.message;
      } else {
        causeMessage = JSON.stringify(exception.response);
      }
    }

    this.loggerService.error(responseError, 'GlobalExceptionFilter', {
      method: request.method,
      path: request.url,
      errorName: exception?.name,
      statusCode: status,
      cause: causeMessage,
    });

    response.status(status).json(process.env.NODE_ENV === 'development' ? devErrorResponse : prodErrorResponse);
  }
}
