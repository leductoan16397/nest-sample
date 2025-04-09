import { HttpStatus } from '@nestjs/common';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { AnyObject } from 'mongoose';

export class BaseResponse<T = unknown> {
  @ApiProperty({
    enumName: 'HttpStatus',
    enum: HttpStatus,
  })
  status: HttpStatus;

  @ApiProperty()
  message: string | string[];

  @ApiProperty()
  data: T;
}

export class ErrorBaseResponse extends OmitType(BaseResponse, ['data']) {
  @ApiProperty({
    required: false,
    type: Object,
  })
  errors?: AnyObject | string;

  @ApiProperty({
    required: false,
  })
  system_message?: string;
}

export class PaginationData<T = unknown> {
  @ApiProperty()
  total: number;

  @ApiProperty()
  data: T[];
}

export class PaginationResponse<T = unknown> extends BaseResponse<PaginationData<T>> {}
