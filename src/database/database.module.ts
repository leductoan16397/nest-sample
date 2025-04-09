import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { ConfigurationType } from 'src/common/config/configuration';
import { UserRepository } from './repository/admin/user.repo';
import { CONN_NAME } from 'src/common/constant/constant';
import { UserModel } from './resource/bo-user.resource';

const categories = [
  // Admin
  UserRepository,
];

@Global()
@Module({
  imports: [
    /* DB Back Office Module */
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<ConfigurationType, true>) => {
        const config: MongooseModuleFactoryOptions = {
          uri: configService.get<ConfigurationType['mongo_dns_back_office']>('mongo_dns_back_office'),
          compressors: ['zstd', 'zlib'],
          zlibCompressionLevel: 9,
        };
        return config;
      },
      connectionName: CONN_NAME,
    }),

    MongooseModule.forFeature([UserModel], CONN_NAME),
  ],
  providers: categories,
  exports: categories,
})
export class DatabaseModule {}
