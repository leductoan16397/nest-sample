import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BOTokenInfoInterface, ROLES_KEY } from './auth.decorator';
import { Role } from 'src/database/resource/bo-user.resource';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    } // Không yêu cầu role, cho phép truy cập

    const request = context.switchToHttp().getRequest();
    const tokenInfo: BOTokenInfoInterface = request['tokenInfo'];

    if (!tokenInfo) {
      throw new UnauthorizedException('Vui lòng đăng nhập trước khi thực hiện chức năng này');
    }

    if (!tokenInfo?.roles) {
      throw new ForbiddenException('Bạn không có quyền thực hiện chức năng này');
    }

    if (!requiredRoles.some((role) => tokenInfo.roles.includes(role))) {
      throw new ForbiddenException('Bạn không có quyền thực hiện chức năng này');
    }

    return true;
  }
}
