import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminKey = request.headers['x-admin-key'];
    
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      throw new UnauthorizedException('Invalid admin key');
    }
    
    return true;
  }
}
