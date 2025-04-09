import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/database/repository/admin/user.repo';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto, LoginDto } from '../dto/login.dto';
import { BOTokenInfoInterface } from 'src/common/guard/auth.decorator';
import { UserLeanType } from 'src/database/resource/bo-user.resource';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async validateUser(payload: BOTokenInfoInterface): Promise<UserLeanType> {
    console.log(`🚀 ~ AuthService ~ validateUser ~ pass:`, payload);
    const user = await this.userRepository.findOneById(payload.account_id);

    if (!user) {
      throw new UnauthorizedException('Không tin thấy thông tin đăng nhập');
    }
    return user;
  }

  async login(payload: LoginDto): Promise<
    {
      access_token: string;
    } & BOTokenInfoInterface
  > {
    console.log('user info here ', payload);
    const userInfo = await this.userRepository.findOneByUsername(payload.username.toLowerCase().trim());
    console.log('user info = ', userInfo);
    if (!userInfo) {
      throw new UnauthorizedException('Không tin thấy thông tin đăng nhập');
    }

    const isPasswordMatching = await bcrypt.compare(payload.password, userInfo.password);

    console.log('password == ', isPasswordMatching);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    const jwtPayload: BOTokenInfoInterface = {
      account_id: userInfo._id.toString(),
      roles: [userInfo.role],
      email: userInfo.email,
      name: userInfo.name,
    };
    return {
      access_token: this.jwtService.sign(jwtPayload),
      account_id: userInfo._id.toString(),
      roles: [userInfo.role],
      email: userInfo.email,
      name: userInfo.name,
    };
  }

  async profile(account_id: string): Promise<UserLeanType> {
    const userInfo = await this.userRepository.findOneById(account_id);
    if (!userInfo) {
      throw new UnauthorizedException('Không tin thấy thông tin đăng nhập');
    }
    return userInfo;
  }

  async changePassword({
    payload,
    tokenInfo,
  }: {
    payload: ChangePasswordDto;
    tokenInfo: BOTokenInfoInterface;
  }): Promise<void> {
    if (payload.newPassword === payload.password) {
      throw new BadRequestException('Mật khẩu mới không được trùng với mật khẩu cũ');
    }

    const user = await this.userRepository.findOneByIdIncludePassword(tokenInfo.account_id);

    if (!user) {
      throw new UnauthorizedException('Không tin thấy thông tin đăng nhập');
    }
    const isPasswordMatching = await bcrypt.compare(payload.password, user.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Mật khẩu không đúng');
    }

    await this.userRepository.updatePassword({
      id: tokenInfo.account_id,
      newPassword: payload.newPassword,
      updated_type: tokenInfo.roles[0],
      updated_by: tokenInfo.account_id,
    });
    return;
  }
}
