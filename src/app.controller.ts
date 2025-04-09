import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { BaseResponse } from './common/res/base.res';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get('health')
  heathCheck(@Res() res: Response<BaseResponse>): Response<BaseResponse> {
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'OK',
      data: 'Healthy',
    });
  }
}
