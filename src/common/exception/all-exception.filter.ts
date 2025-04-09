import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Request } from 'express';
import { AnyObject } from 'mongoose';
import { TelegramBotService } from 'src/modules/internal/service/telegram.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly telegramService: TelegramBotService,
  ) {}

  catch(exception: ExecutionContextHost, host: ExecutionContextHost): void {
    console.log('🚀 ~ AllExceptionsFilter ~ exception:', exception);

    if (host['contextType'] === 'rmq') {
      this.rmq(exception, host);
      return;
    }
    this.http(exception, host);
  }

  http(exception: ExecutionContextHost, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus: HttpStatus =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      status: httpStatus,
      message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
      data: null,
      system_message: (exception as unknown as Error).message,
    };

    const request: Request = ctx.getRequest();
    this.telegramService.sendMessageToDevops({
      message: `${JSON.stringify(exception, null, 2)} \n ${JSON.stringify(exception['stack'], null, 2)}`,
    });
    this.telegramService.sendMessageToDevops({
      message: `${request.method}|${request.originalUrl || request.url}|
HEADERS: ${JSON.stringify(request.headers, null, 2)}
PARAMS: ${JSON.stringify(request.params, null, 2)}
QUERY: ${JSON.stringify(request.query, null, 2)} 
BODY: ${JSON.stringify(request.body, null, 2)}
`,
    });
    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }

  rmq(exception: ExecutionContextHost, host: ExecutionContextHost): void {
    const payload: AnyObject = host.getArgByIndex(0);
    const request: AnyObject = host.getArgByIndex(1);

    this.telegramService.sendMessageToDevops({
      message: `${JSON.stringify(exception, null, 2)} \n ${JSON.stringify(exception['stack'], null, 2)}`,
    });

    this.telegramService.sendMessageToDevops({
      message: `
QUEUE: ${JSON.stringify(request.fields, null, 2)} 
PAYLOAD: ${JSON.stringify(payload, null, 2)}
      `,
    });
  }
}
