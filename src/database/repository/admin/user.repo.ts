import { FilterQuery, Model, QueryOptions, UpdateQuery } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationData } from 'src/common/res/base.res';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CONN_NAME } from 'src/common/constant/constant';
import { User, UserLeanType, UserModel } from 'src/database/resource/bo-user.resource';

const defaultTtl = 1000 * 60 * 5;
@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel.name, CONN_NAME) private userModel: Model<User>,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private async _getCacheByKey<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(`admin:${UserModel.name}:${key}`);
  }

  private async _setCacheByKey<T>(key: string, data: T, ttl?: number): Promise<void> {
    return this.cache.set(`admin:${UserModel.name}:${key}`, data, ttl || defaultTtl);
  }

  private async _deleteCacheByKey(key: string): Promise<void> {
    return this.cache.del(`admin:${UserModel.name}:${key}`);
  }

  private async _cacheData(data: UserLeanType): Promise<void> {
    const key = `id:${data._id.toString()}`;
    await this._setCacheByKey(key, data, defaultTtl);
  }

  async checkExistUserByUsername(username: string): Promise<boolean> {
    const exists = await this.userModel.exists({ username: username, deleted_at: null });

    return !!exists;
  }

  async findOneByUsername(username: string): Promise<UserLeanType | null> {
    return this.userModel.findOne({ username: username, deleted_at: null }).select('+password').lean();
  }

  async createNewUser(payload: User): Promise<UserLeanType> {
    return (await this.userModel.create(payload)).toObject();
  }

  async findOneById(id: string): Promise<UserLeanType | null> {
    const cacheKeyId = `id:${id}`;
    const cacheData = await this._getCacheByKey<UserLeanType>(cacheKeyId);
    if (cacheData) {
      return new this.userModel(cacheData).toObject();
    }
    const value = await this.userModel.findById(id).where('deleted_at').equals(null).lean();
    if (value) {
      this._cacheData(value);
    }
    return value;
  }

  async findOneByIdIncludePassword(id: string): Promise<UserLeanType | null> {
    return this.userModel.findById(id).select('+password').where('deleted_at').equals(null).lean();
  }

  async updateOne({
    id,
    updateData,
  }: {
    id: string;
    updateData: UpdateQuery<Omit<User, 'username'>>;
  }): Promise<UserLeanType | null> {
    const value = await this.userModel
      .findByIdAndUpdate(id, updateData, { lean: true, new: true })
      .where('deleted_at')
      .equals(null);
    if (value) {
      if (value?.deleted_at) {
        this._deleteCacheByKey(`id:${id}`);
      } else {
        this._cacheData(value);
      }
    }
    return value;
  }

  async delete({
    id,
    deleted_by,
    deleted_type,
  }: {
    id: string;
    deleted_by: string;
    deleted_type: string;
  }): Promise<UserLeanType | null> {
    const value = await this.updateOne({
      id,
      updateData: {
        deleted_at: new Date(),
        deleted_by,
        deleted_type,
      },
    });
    if (value) {
      this._deleteCacheByKey(`id:${id}`);
    }
    return value;
  }

  async updatePassword({
    id,
    newPassword,
    updated_by,
    updated_type,
  }: {
    id: string;
    newPassword: string;
    updated_by: string;
    updated_type: string;
  }): Promise<UserLeanType | null> {
    return this.updateOne({
      id,
      updateData: {
        password: newPassword,
        updated_by,
        updated_type,
      },
    });
  }

  async count({ filter }: { filter: FilterQuery<User> }): Promise<number> {
    return this.userModel.countDocuments({
      deleted_at: null,
      ...filter,
    });
  }

  async find({ filter, option }: { filter: FilterQuery<User>; option?: QueryOptions<User> }): Promise<UserLeanType[]> {
    return this.userModel
      .find(
        {
          deleted_at: null,
          ...filter,
        },
        {},
        {
          sort: {
            created_at: -1,
          },
          ...option,
        },
      )
      .lean();
  }

  async findAndCount({
    filter,
    paging,
  }: {
    filter: FilterQuery<User>;
    paging: QueryOptions<User>;
  }): Promise<PaginationData<UserLeanType>> {
    if (paging.limit && paging.limit < 0) {
      const data = await this.find({
        filter,
      });
      return {
        data: data,
        total: data.length,
      };
    }
    const [data, total] = await Promise.all([
      this.find({
        filter,
        option: {
          limit: paging.limit || 20,
          skip: paging.skip || 0,
          sort: paging.sort || {
            created_at: -1,
          },
        },
      }),
      this.count({ filter }),
    ]);

    return {
      total,
      data: data,
    };
  }
}
