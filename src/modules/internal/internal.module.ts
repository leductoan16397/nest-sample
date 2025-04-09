import { Global, Module } from '@nestjs/common';
import { TelegramBotService } from './service/telegram.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, ClientProvider, RmqOptions, Transport } from '@nestjs/microservices';
import { ConfigurationType } from 'src/common/config/configuration';
import { CdnInternalService, CdnInternalBrokerQueue } from 'src/common/constant/constant';
import { AiRpcService } from './service/ai.rpc.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync({
      clients: [
        {
          name: CdnInternalService.AI,
          imports: [ConfigModule],
          inject: [ConfigService],
          async useFactory(configService: ConfigService<ConfigurationType, true>): Promise<ClientProvider> {
            const rabbitMQUrl = configService.get<ConfigurationType['rabbitmq']>('rabbitmq');
            const config: RmqOptions = {
              transport: Transport.RMQ,
              options: {
                consumerTag: 'CDN_admin_service',
                urls: [rabbitMQUrl],
                queue: CdnInternalBrokerQueue.AI,
                noAssert: true,
              },
            };
            return config;
          },
        },
      ],
    }),
  ],
  providers: [TelegramBotService, AiRpcService],
  exports: [TelegramBotService, AiRpcService],
})
export class InternalModule {}
