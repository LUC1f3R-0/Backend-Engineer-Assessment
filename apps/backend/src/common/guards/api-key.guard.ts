import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { getAppConfig } from '../../config/app.config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.method === 'OPTIONS') {
      return true;
    }

    const expected = getAppConfig().xApiKey;
    const key = req.headers['x-api-key'];
    if (!expected || key !== expected) {
      throw new UnauthorizedException('Invalid or missing x-api-key');
    }
    return true;
  }
}
