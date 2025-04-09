import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BOTokenInfoInterface, Roles, TokenInfo } from 'src/common/guard/auth.decorator';
import { CreateUserDto, UpdateUserDto, UserPaginationQuery } from '../dto/user.dto';
import { BaseResponse, PaginationResponse } from 'src/common/res/base.res';
import { Response } from 'express';
import { UserService } from '../services/user.service';
import { CdnLoggedApiResponse } from 'src/common/decorator/api-response.decorator';
import { MongoIdPipe } from 'src/common/pipelines/mongoid.pipe';
import { Role, UserLeanType } from 'src/database/resource/bo-user.resource';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('')
  @Roles(Role.ADMIN)
  @CdnLoggedApiResponse()
  async users(
    @Query() query: UserPaginationQuery,
    @Res() response: Response<BaseResponse>,
    // @TokenInfo() tokenInfo: JwtTokenInfoInterface,
  ): Promise<Response<PaginationResponse<UserLeanType>>> {
    const result = await this.userService.getUsers({ filter: query });
    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Get users successfully',
      data: result,
    });
  }

  @Post('')
  @Roles(Role.ADMIN)
  @CdnLoggedApiResponse()
  async createNewUser(
    @Body() payload: CreateUserDto,
    @Res() response: Response<BaseResponse>,
    @TokenInfo() tokenInfo: BOTokenInfoInterface,
  ): Promise<Response<BaseResponse>> {
    const result = await this.userService.createNewUser(payload, tokenInfo);
    return response.status(HttpStatus.CREATED).json({
      status: HttpStatus.CREATED,
      message: 'Create new user successfully',
      data: result,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  @CdnLoggedApiResponse()
  async detail(
    @Param('id', MongoIdPipe) id: string,
    @Res() response: Response<BaseResponse>,
    // @TokenInfo() tokenInfo: JwtTokenInfoInterface,
  ): Promise<Response<BaseResponse>> {
    const result = await this.userService.detail(id);
    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Get user detail successfully',
      data: result,
    });
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @CdnLoggedApiResponse()
  async update(
    @Param('id', MongoIdPipe) id: string,
    @Res() response: Response<BaseResponse>,
    @Body() payload: UpdateUserDto,
    @TokenInfo() tokenInfo: BOTokenInfoInterface,
  ): Promise<Response<BaseResponse>> {
    const result = await this.userService.update({
      id,
      payload,
      tokenInfo,
    });
    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'update user successfully',
      data: result,
    });
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @CdnLoggedApiResponse()
  async delete(
    @Param('id', MongoIdPipe) id: string,
    @Res() response: Response<BaseResponse>,
    @TokenInfo() tokenInfo: BOTokenInfoInterface,
  ): Promise<Response<BaseResponse>> {
    const result = await this.userService.delete({
      tokenInfo,
      user_id: id,
    });
    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'delete user successfully',
      data: result,
    });
  }

  @Patch(':id/reset-password')
  @Roles(Role.ADMIN)
  @CdnLoggedApiResponse()
  async resetPassword(
    @Param('id') id: string,
    @Res() response: Response<BaseResponse>,
    @TokenInfo() tokenInfo: BOTokenInfoInterface,
  ): Promise<Response<BaseResponse>> {
    const result = await this.userService.resetPassword({
      tokenInfo,
      user_id: id,
    });
    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Reset Password successfully',
      data: result,
    });
  }
}
