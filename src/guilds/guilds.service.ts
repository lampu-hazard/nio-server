import { Injectable } from '@nestjs/common';
import { PermissionsBitField } from 'discord.js';
import { DiscordBotService } from '../discord/discord-bot.service';
import { PrismaService } from '../prisma/prisma.service';

const MANAGE_GUILD = 0x20n;
const MANAGE_ROLES = 0x10000000n;
const ADMINISTRATOR = 0x8n;

@Injectable()
export class GuildsService {
  constructor(
    private readonly bot: DiscordBotService,
    private readonly prisma: PrismaService,
  ) {}

  canManage(userGuild: any): boolean {
    const perms = BigInt(userGuild.permissions || '0');
    return (perms & ADMINISTRATOR) === ADMINISTRATOR || (perms & MANAGE_GUILD) === MANAGE_GUILD || (perms & MANAGE_ROLES) === MANAGE_ROLES;
  }

  listManageable(sessionGuilds: any[] = []) {
    return sessionGuilds.filter((g) => this.canManage(g)).map((g) => ({
      ...g,
      botInGuild: this.bot.client.guilds.cache.has(g.id),
      inviteUrl: this.inviteUrl(g.id),
      iconUrl: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
    }));
  }

  async getGuild(guildId: string) {
    return this.bot.client.guilds.cache.get(guildId) || this.bot.client.guilds.fetch(guildId);
  }

  async getChannels(guildId: string) {
    const guild = await this.getGuild(guildId);
    await guild.channels.fetch();
    return guild.channels.cache.filter((c) => c.isTextBased()).map((c) => ({ id: c.id, name: c.name, type: c.type }));
  }

  async getRoles(guildId: string) {
    const guild = await this.getGuild(guildId);
    await guild.roles.fetch();
    const me = guild.members.me || await guild.members.fetchMe();
    return guild.roles.cache.filter((r) => r.id !== guild.id && !r.managed).map((r) => ({
      id: r.id,
      name: r.name,
      color: r.hexColor,
      position: r.position,
      manageable: me.permissions.has(PermissionsBitField.Flags.ManageRoles) && r.position < me.roles.highest.position,
    })).sort((a, b) => b.position - a.position);
  }

  inviteUrl(guildId: string) {
    const params = new URLSearchParams({ client_id: process.env.DISCORD_CLIENT_ID || '', permissions: '268435456', scope: 'bot applications.commands', guild_id: guildId, disable_guild_select: 'true' });
    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  }

  async getAuditLogs(guildId: string) {
    return this.prisma.auditLog.findMany({
      where: { guildId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            globalName: true,
            avatar: true,
          },
        },
        panel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
