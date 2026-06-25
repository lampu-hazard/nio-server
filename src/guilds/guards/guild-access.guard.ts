import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppError } from '../../common/errors/app-error';

const MANAGE_GUILD = 0x20n;
const MANAGE_ROLES = 0x10000000n;
const ADMINISTRATOR = 0x8n;

@Injectable()
export class GuildAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const guildId = req.params.guildId;
    const guilds = req.session.guilds || [];
    const guild = guilds.find((g: any) => g.id === guildId);
    if (!guild) {
      if (req.url?.includes('/stickers')) {
        console.warn('[StickerGuildDebug]', {
          method: req.method,
          url: req.url,
          guildId,
          hasUser: Boolean(req.session?.user),
          guildCount: guilds.length,
          guildIds: guilds.map((g: any) => g.id),
        });
      }
      throw new AppError('GUILD_ACCESS_DENIED', 'Guild access denied', 403);
    }
    const perms = BigInt(guild.permissions || '0');
    const ok = (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD || (perms & MANAGE_ROLES) === MANAGE_ROLES;
    if (!ok) {
      if (req.url?.includes('/stickers')) {
        console.warn('[StickerGuildDebug]', { method: req.method, url: req.url, guildId, permissions: guild.permissions });
      }
      throw new AppError('GUILD_ACCESS_DENIED', 'Guild access denied', 403);
    }
    return true;
  }
}
