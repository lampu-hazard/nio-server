import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { GuildAccessGuard } from './guards/guild-access.guard';
import { GuildsService } from './guilds.service';

@UseGuards(SessionAuthGuard)
@Controller('guilds')
export class GuildsController {
  constructor(private readonly guilds: GuildsService) {}

  @Get()
  list(@Req() req: Request) {
    return { ok: true, guilds: this.guilds.listManageable(req.session.guilds || []) };
  }

  @Get(':guildId/channels')
  async channels(@Param('guildId') guildId: string) {
    return { ok: true, channels: await this.guilds.getChannels(guildId) };
  }

  @Get(':guildId/roles')
  async roles(@Param('guildId') guildId: string) {
    return { ok: true, roles: await this.guilds.getRoles(guildId) };
  }

  @UseGuards(GuildAccessGuard)
  @Get(':guildId/audit-logs')
  async auditLogs(@Param('guildId') guildId: string) {
    return { ok: true, auditLogs: await this.guilds.getAuditLogs(guildId) };
  }
}
