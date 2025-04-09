import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { BOTokenInfoInterface } from './auth.decorator';
import { AuthService } from 'src/modules/auth/services/auth.service';

interface DecodedJwtAccessTokenInterface extends BOTokenInfoInterface {
  exp: number;
  iat: number;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //Ktra xem co can auth ko?
    //Lay request va bearer token
    const request: Request = context.switchToHttp().getRequest();
    const authHeaders = request.headers.authorization;

    //Ktra neu ko co token => bao loi
    if (!authHeaders?.split(' ')[1]) {
      throw new UnauthorizedException('Vui lòng đăng nhập trước khi thực hiện chức năng này');
    }
    const token = authHeaders.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Vui lòng đăng nhập trước khi thực hiện chức năng này');
    }

    let decodedJwtAccessToken: DecodedJwtAccessTokenInterface | null = null;
    try {
      decodedJwtAccessToken = await this.jwtService.verifyAsync<DecodedJwtAccessTokenInterface>(token);
    } catch (error) {
      if ((error as JsonWebTokenError).name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token đã hết hạn');
      } else if ((error as JsonWebTokenError).name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token không hợp lệ');
      } else {
        throw new UnauthorizedException('Lỗi xác thực token');
      }
    }

    //Phan tich du lieu token
    // const decodedJwtAccessToken = this.jwtService.decode<DecodedJwtAccessTokenInterface>(token);

    // if (!decodedJwtAccessToken) {
    //   throw new UnauthorizedException('Vui lòng đăng nhập trước khi thực hiện chức năng này');
    // }

    // if (decodedJwtAccessToken.exp > new Date().getTime()) {
    //   throw new ForbiddenException('Token đã hết hạn');
    // }

    const user = await this.authService.validateUser(decodedJwtAccessToken);

    request['tokenInfo'] = {
      account_id: decodedJwtAccessToken.account_id,
      roles: [user.role],
      email: user.email,
      name: user.name,
    };

    return true;
  }
}
