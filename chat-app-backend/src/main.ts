import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import helmet from 'helmet'; // Import helmet directly
import { GlobalExceptionFilter } from './utils/global.exception.filter';
import { LoggerService } from './logger/logger.service';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Sentry initialization
  Sentry.init({
    dsn: configService.get<string>('SENTRY_DNS'),
    integrations: [new ProfilingIntegration()],
    tracesSampleRate: 1.0, // Capture 100% of the transactions
    profilesSampleRate: 1.0, // Set sampling rate for profiling
  });

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  // Logger middleware
  app.use(morgan('tiny'));

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true, whitelist: true }));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(new LoggerService()));

  // Body parser middleware
  app.use(
    bodyParser.json({
      verify: (req, res, buffer) => (req['rawBody'] = buffer),
    }),
  );

  // Helmet middleware for securing headers
  app.use(helmet());

 // CORS configuration
 app.enableCors({
  origin:'http://localhost:3000', 
  credentials:true,

});

  const loggerService = app.get(LoggerService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  loggerService.log(`Chat App Backend API is listening on: localhost:${port} 🚀🚀`, 'Main');
}

bootstrap().catch((error) => {
  const loggerService = new LoggerService();
  loggerService.error('Error during bootstrapping:', error);
  process.exit(1);
});
