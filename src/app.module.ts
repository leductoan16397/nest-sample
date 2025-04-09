import { MiddlewareConsumer, Module, NestModule, OnModuleInit, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './modules/user/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { InternalModule } from './modules/internal/internal.module';
import { configuration, ConfigurationType } from './common/config/configuration';
import { DatabaseModule } from './database/database.module';
import * as mongoose from 'mongoose';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { CacheModule, CacheOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Cache
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      isGlobal: true,
      useFactory: async (configService: ConfigService<ConfigurationType>) => {
        const store = await redisStore({
          url: configService.get<ConfigurationType['host_redis']>('host_redis'),
        });
        const config: CacheOptions = {
          store: store,
          ttl: 300 * 1000,
        };
        return config;
      },
    }),

    DatabaseModule,
    UserModule,
    AuthModule,

    // Giao tiếp với nội bộ
    InternalModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements OnModuleInit, NestModule {
  onModuleInit(): void {
    mongoose.set('runValidators', true);
    mongoose.set('strictQuery', true);
    // mongoose.set('debug', true);
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
