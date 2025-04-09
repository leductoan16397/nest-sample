import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/database/repository/admin/user.repo';
import { CreateUserDto, UpdateUserDto, UserPaginationQuery } from '../dto/user.dto';
import { BOTokenInfoInterface } from 'src/common/guard/auth.decorator';
import { PaginationData } from 'src/common/res/base.res';
import { FilterQuery } from 'mongoose';
import { generateRandomPassword } from 'src/common/util/string.util';
import { isMongoId } from 'class-validator';
import { UserLeanType, User } from 'src/database/resource/bo-user.resource';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUsers({ filter }: { filter: UserPaginationQuery }): Promise<PaginationData<UserLeanType>> {
    const query: FilterQuery<User> = {};
    const rs = await this.userRepository.findAndCount({
      filter: query,
      paging: {
        limit: filter.limit,
        skip: filter.offset,
        ...(filter.sort &&
          filter.order && {
            sort: {
              [filter.sort]: filter.order,
            },
          }),
      },
    });
    console.log(`🚀 ~ CategoryAttributeService ~ getCategoryAttributes ~ rs:`, rs);
    return rs;
  }

  async createNewUser(payload: CreateUserDto, tokenInfo: BOTokenInfoInterface): Promise<User> {
    const existUser = await this.userRepository.checkExistUserByUsername(payload.username.toLowerCase());
    if (existUser) {
      throw new BadRequestException('Username already exists');
    }
    return this.userRepository.createNewUser({
      email: payload.email.trim(),
      password: payload.password,
      name: payload.name.trim(),
      username: payload.username.toLowerCase(),
      phone: payload.phone.trim(),
      role: payload.role,
      created_by: tokenInfo.account_id,
      created_type: tokenInfo.roles[0],
    });
  }

  async detail(id: string): Promise<UserLeanType> {
    const userInfo = await this.userRepository.findOneById(id);
    if (!userInfo) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    return userInfo;
  }

  async resetPassword({ tokenInfo, user_id }: { user_id: string; tokenInfo: BOTokenInfoInterface }): Promise<string> {
    let id: string | null = null;
    if (isMongoId(user_id)) {
      const user = await this.userRepository.findOneById(user_id);
      if (!user) {
        throw new BadRequestException('Khong tim thay user');
      }
      id = user._id.toString();
    } else {
      const user = await this.userRepository.findOneByUsername(user_id);
      if (!user) {
        throw new BadRequestException('Khong tim thay user');
      }
      id = user._id.toString();
    }
    const newPassword = generateRandomPassword(8);
    await this.userRepository.updatePassword({
      id: id,
      newPassword: newPassword,
      updated_by: tokenInfo.account_id,
      updated_type: tokenInfo.roles[0],
    });
    return newPassword;
  }

  async delete({ tokenInfo, user_id }: { user_id: string; tokenInfo: BOTokenInfoInterface }): Promise<UserLeanType> {
    const user = await this.userRepository.findOneById(user_id);
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }

    const userInfo = await this.userRepository.delete({
      id: user_id,
      deleted_by: tokenInfo.account_id,
      deleted_type: tokenInfo.roles[0],
    });
    if (!userInfo) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    return userInfo;
  }

  async update({
    id,
    payload,
    tokenInfo,
  }: {
    id: string;
    payload: UpdateUserDto;
    tokenInfo: BOTokenInfoInterface;
  }): Promise<UserLeanType | null> {
    const user = await this.userRepository.findOneById(id);
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại');
    }
    return this.userRepository.updateOne({
      id,
      updateData: {
        email: payload.email?.trim(),
        name: payload.name?.trim(),
        phone: payload.phone?.trim(),
        role: payload.role,
        updated_by: tokenInfo.account_id,
        updated_type: tokenInfo.roles[0],
      },
    });
  }
}
