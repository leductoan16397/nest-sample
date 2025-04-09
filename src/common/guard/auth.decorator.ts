import { applyDecorators, createParamDecorator, ExecutionContext, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Role } from 'src/database/resource/bo-user.resource';

export interface BOTokenInfoInterface {
  account_id: string;
  roles: Role[];
  email: string;
  name: string;
}

export const ROLES_KEY = 'CDN_AUTHORIZATION';
export const AUTH_KEY = 'CDN_AUTHENTICATION';

export const Authorization = (): MethodDecorator => applyDecorators(UseGuards(AuthenticationGuard));

export const TokenInfo = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const { tokenInfo } = request;
  return tokenInfo as BOTokenInfoInterface;
});

export const Roles = (...roles: Role[]): MethodDecorator =>
  applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(AuthenticationGuard, RolesGuard));
