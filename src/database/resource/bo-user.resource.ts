import { ModelDefinition, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AnyObject, HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { DeleteAndModifierEntity, QUERY_MIDDLEWARES, READ_MODE } from './base.resource';
export const SALT_ROUND = 10;

const hashString = (str: string): string | null => {
  if (!str || str.length <= 0) {
    return null;
  }
  const hashed = bcrypt.hashSync(str, SALT_ROUND);
  return hashed;
};

export type UserDocumentType = HydratedDocument<User>;

export type UserLeanType = User & { _id: Types.ObjectId };

export enum Role {
  ADMIN = 'admin',
  STAFF = 'staff',
  GUEST = 'guest',
}

@Schema({
  collection: 'user',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
  toJSON: {
    virtuals: true,
  },
  toObject: {
    virtuals: true,
  },
  versionKey: false,
  strictQuery: true,
})
export class User extends DeleteAndModifierEntity {
  @Prop({ required: true })
  name!: string;

  @Prop({})
  avatar?: string;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true, set: hashString, select: false })
  password!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ required: true, enum: Role })
  role!: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

UserSchema.pre(QUERY_MIDDLEWARES, async function (next) {
  const that = this as AnyObject;
  if (!that.options?.session) {
    that.options.readPreference = that.options.readPreference || READ_MODE;
  }
  if (that._mongooseOptions && that._mongooseOptions.lean === undefined) {
    that._mongooseOptions.lean = true;
  }
  return next();
}).pre('aggregate', async function (next) {
  const that = this as AnyObject;
  if (!that.options?.session) {
    that.options.readPreference = that.options.readPreference || READ_MODE;
  }
  return next();
});

export const UserModel: ModelDefinition = {
  name: 'user',
  collection: 'user',
  schema: UserSchema,
};
