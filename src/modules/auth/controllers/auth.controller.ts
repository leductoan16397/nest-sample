import { Controller, Post, Body, Res, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { ChangePasswordDto, LoginDto } from '../dto/login.dto';
import { BaseResponse } from 'src/common/res/base.res';
import { Response } from 'express';
import { Authorization, TokenInfo, BOTokenInfoInterface } from 'src/common/guard/auth.decorator';
import { CdnLoggedApiResponse, CdnPublicApiResponse } from 'src/common/decorator/api-response.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @CdnPublicApiResponse()
  async login(@Body() body: LoginDto, @Res() response: Response<BaseResponse>): Promise<Response<BaseResponse>> {
    const result = await this.authService.login(body);

    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Login successfully',
      data: result,
    });
  }

  @Post('logout')
  @Authorization()
  @CdnLoggedApiResponse()
  async logout(@Res() response: Response<BaseResponse>): Promise<Response<BaseResponse>> {
    // return this.authService.logout(body);

    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Logout successfully',
      data: null,
    });
  }

  @Post('change-password')
  @Authorization()
  @CdnLoggedApiResponse()
  async changePassword(
    @Body() body: ChangePasswordDto,
    @TokenInfo() tokenInfo: BOTokenInfoInterface,
    @Res() response: Response<BaseResponse>,
  ): Promise<Response<BaseResponse>> {
    await this.authService.changePassword({
      payload: body,
      tokenInfo,
    });

    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Change password successfully',
      data: null,
    });
  }

  @Get('profile')
  @Authorization()
  @CdnLoggedApiResponse()
  async getProfile(
    @TokenInfo() tokenInfo: BOTokenInfoInterface,
    @Res() response: Response<BaseResponse>,
  ): Promise<Response<BaseResponse>> {
    console.log('token info == ', tokenInfo);
    const userInfo = await this.authService.profile(tokenInfo.account_id);
    console.log('user info = ', userInfo);

    return response.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: 'Get profile successfully',
      data: userInfo,
    });
  }
}
