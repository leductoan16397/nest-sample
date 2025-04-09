import { Catch, RpcExceptionFilter, ExceptionFilter, HttpException } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { sendMessageToDevops } from 'src/modules/internal/service/telegram.service';
import { AnyObject } from 'mongoose';

@Catch(RpcException)
export class RedisExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException): Observable<AnyObject> {
    const error = exception.getError();
    const httpStatus = (error as AnyObject).status || (error as AnyObject).statusCode;

    if (!httpStatus || httpStatus === 500) {
      sendMessageToDevops({
        message: `${JSON.stringify(exception, null, 2)} \n ${JSON.stringify(exception['stack'], null, 2)}`,
      });
    }

    return throwError(() => error);
  }
}

@Catch(HttpException)
export class TranslateHttpToGrpcExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException): Observable<AnyObject> {
    const httpStatus = exception.getStatus();
    const httpRes = exception.getResponse() as { details?: unknown; message: unknown };

    if (httpStatus === 500) {
      sendMessageToDevops({
        message: `${JSON.stringify(exception, null, 2)} \n ${JSON.stringify(exception['stack'], null, 2)}`,
      });
    }

    return throwError(() => ({
      code: httpStatus,
      message: httpRes.message || exception.message,
      details: Array.isArray(httpRes.details) ? httpRes.details : httpRes.message,
    }));
  }
}
