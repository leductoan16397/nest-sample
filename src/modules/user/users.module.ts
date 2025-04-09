import { Module } from '@nestjs/common';

import { UserService } from './services/user.service';
import { UsersController } from './controllers/user.controller';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
