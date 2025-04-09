import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from './common/config/configuration';
import { AllExceptionsFilter } from './common/exception/all-exception.filter';
import { HttpExceptionFilter } from './common/exception/http-exception.filter';
import { TelegramBotService } from './modules/internal/service/telegram.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerConfiguration } from './common/config/swagger.config';

async function bootstrap(): Promise<void> {
  console.log('[Nest] Starting server...');
  console.time('[Nest] Server start time');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Admin Service');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const configService = app.get<ConfigService<ConfigurationType, true>>(ConfigService);

  const telegramDevopsBotService = app.get(TelegramBotService);

  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost), telegramDevopsBotService),
    new HttpExceptionFilter(telegramDevopsBotService),
  );

  app.useBodyParser('json', { limit: '50mb' });
  app.useBodyParser('raw', { limit: '50mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '5mb' });

  app.set('trust proxy', true);
  app.enableCors({
    origin: '*',
    allowedHeaders: ['recaptcha', 'content-type', 'authorization', 'X-Shop-Id'],
    maxAge: 3600,
    credentials: true,
  });

  const port = configService.get<ConfigurationType['port']>('port') || 1321;

  /**
   * Swagger
   */

  SwaggerConfiguration({ app, configService });

  await app.listen(port).then(() => {
    logger.debug(`Application is running on: http://localhost:${port}`);
    logger.debug(`Swagger is running on: http://localhost:${port}/docs`);
  });
  console.timeEnd('[Nest] Server start time');
}
bootstrap();
