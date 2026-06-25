import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppError } from '../../common/errors/app-error';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.session?.user) {
      if (request.url?.includes('/stickers')) {
        console.warn('[StickerAuthDebug]', {
          method: request.method,
          url: request.url,
          hasCookie: Boolean(request.headers?.cookie),
          hasSessionID: Boolean(request.sessionID),
          hasSession: Boolean(request.session),
          hasUser: Boolean(request.session?.user),
          guildCount: request.session?.guilds?.length ?? 0,
        });
      }
      throw new AppError('AUTH_REQUIRED', 'Login required', 401);
    }
    return true;
  }
}
