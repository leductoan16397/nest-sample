import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { UpdateWriteOpResult } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { ConfigurationType } from 'src/common/config/configuration';
import { Environment, CdnInternalService } from 'src/common/constant/constant';
import { BaseResponse } from 'src/common/res/base.res';

@Injectable()
export class AiRpcService {
  private readonly _node_env = this.configService.get<ConfigurationType['node_env']>('node_env') ?? Environment.DEV;

  constructor(
    @Inject(CdnInternalService.AI) private client: ClientProxy,
    private readonly configService: ConfigService<ConfigurationType, true>,
  ) {
    client.connect().then(() => {
      console.warn('AiRpcService connected');
    });
  }

  async deleteAllBuyerConversationByAccountId(message: {
    account_id: string;
    role: string;
    owner_id: string;
  }): Promise<UpdateWriteOpResult> {
    try {
      const response = await lastValueFrom<BaseResponse<UpdateWriteOpResult>>(
        this.client.send('DeleteAllBuyerConversationByAccountId', message),
      );

      return response.data;
    } catch (error) {
      throw new RpcException(error as Error);
    }
  }
}
