import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Request, Response } from 'express';
import { AnyObject } from 'mongoose';
import { TelegramBotService } from 'src/modules/internal/service/telegram.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly telegramService: TelegramBotService) {}

  private _generateMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'object' && 'message' in response && Array.isArray(response.message)) {
      return response.message[0];
    }
    return exception.message;
  }

  private _generateBadRequestData(exception: HttpException): AnyObject | string | null {
    if (Array.isArray(exception['response']?.message)) {
      const grouped: AnyObject = exception['response'].message.reduce((acc, msg) => {
        const key = msg.split(' ')[0];

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(msg);

        return acc;
      }, {});

      return grouped;
    }
    return exception.message || null;
  }

  catch(exception: HttpException, host: ExecutionContextHost): void {
    console.log(`🚀 ~ HttpExceptionFilter ~ exception:`, exception);

    if (host['contextType'] === 'rmq') {
      this.rmq(exception, host);
      return;
    }
    this.http(exception, host);
  }

  rmq(exception: HttpException, host: ExecutionContextHost): void {
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

  http(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request: Request = ctx.getRequest();
    const response = ctx.getResponse<Response>();
    const status: HttpStatus = exception.getStatus();

    let data: AnyObject | string | null = null,
      message: string = this._generateMessage(exception);
    const system_message: string = exception.message;

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        data = this._generateBadRequestData(exception);
        break;

      case HttpStatus.INTERNAL_SERVER_ERROR: {
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
        message = 'Đã có lỗi xảy ra, vui lòng thử lại sau';
        break;
      }
      default:
        break;
    }

    const responseBody = {
      status: status,
      message,
      data,
      system_message,
    };

    response.status(status).json(responseBody);
  }
}
