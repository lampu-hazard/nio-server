import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client, Message, TextChannel } from 'discord.js';
import { AppLogger } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

interface SlowmodeSettings {
  enabled: boolean;
  channels: Set<string>;
  intervalQuiet: number;
  intervalBusy: number;
}

@Injectable()
export class DiscordSlowmodeService implements OnModuleInit, OnModuleDestroy {
  private readonly settingsCache = new Map<string, SlowmodeSettings>();
  private readonly messageTimestamps = new Map<string, number[]>();
  private readonly lastMessageTime = new Map<string, number>();
  private readonly lastUpdateTime = new Map<string, number>();
  private readonly startedAt = Date.now();
  private client: Pick<Client, 'channels'> | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: AppLogger,
  ) {}

  setClient(client: Pick<Client, 'channels'>) {
    this.client = client;
  }

  async onModuleInit() {
    await this.loadAllSettings();

    this.checkInterval = setInterval(() => {
      this.checkQuietChannels().catch((err: Error) => {
        this.logger.error(`Quiet channel check error: ${err.message}`, err.stack, 'DiscordSlowmode');
      });
    }, 15000);
  }

  onModuleDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async loadAllSettings() {
    try {
      const allSettings = await this.prisma.guildSettings.findMany();
      for (const settings of allSettings) {
        this.settingsCache.set(settings.guildId, {
          enabled: settings.slowmodeEnabled,
          channels: new Set(settings.slowmodeChannels),
          intervalQuiet: settings.slowmodeIntervalQuiet,
          intervalBusy: settings.slowmodeIntervalBusy,
        });
      }
      this.logger.log(`Loaded slowmode settings for ${allSettings.length} guilds.`, 'DiscordSlowmode');
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to load slowmode settings: ${error.message}`, error.stack, 'DiscordSlowmode');
    }
  }

  updateGuildCache(guildId: string, settings: {
    slowmodeEnabled: boolean;
    slowmodeChannels: string[];
    slowmodeIntervalQuiet: number;
    slowmodeIntervalBusy: number;
  }) {
    this.settingsCache.set(guildId, {
      enabled: settings.slowmodeEnabled,
      channels: new Set(settings.slowmodeChannels),
      intervalQuiet: settings.slowmodeIntervalQuiet,
      intervalBusy: settings.slowmodeIntervalBusy,
    });
    this.logger.log(`Updated in-memory slowmode settings for guild: ${guildId}`, 'DiscordSlowmode');
  }

  async handleMessage(message: Message) {
    if (!message.guild || message.author.bot) return;

    const config = this.settingsCache.get(message.guild.id);
    if (!config || !config.enabled || !config.channels.has(message.channel.id)) return;

    const channel = this.asSlowmodeChannel(message.channel as TextChannel);
    if (!channel) return;

    const channelId = channel.id;
    const now = Date.now();
    this.lastMessageTime.set(channelId, now);

    const timestamps = [...(this.messageTimestamps.get(channelId) ?? []), now];
    const activeTimestamps = timestamps.filter((timestamp) => timestamp > now - 10000);
    this.messageTimestamps.set(channelId, activeTimestamps);

    if (activeTimestamps.length >= 10) {
      await this.setSlowmode(channel, config.intervalBusy, 'Busy Chat Detected');
    }
  }

  private async checkQuietChannels() {
    const now = Date.now();

    for (const config of this.settingsCache.values()) {
      if (!config.enabled) continue;

      for (const channelId of config.channels) {
        const channel = await this.resolveChannel(channelId);
        if (!channel) continue;

        const lastMessageTime = this.lastMessageTime.get(channelId) ?? this.startedAt;
        if (now - lastMessageTime > 30000) {
          await this.setSlowmode(channel, config.intervalQuiet, 'Inactivity Cooldown');
        }
      }
    }
  }

  private async setSlowmode(channel: TextChannel, seconds: number, reason: string) {
    if (channel.rateLimitPerUser === seconds) return;

    const channelId = channel.id;
    const now = Date.now();
    const lastUpdate = this.lastUpdateTime.get(channelId) ?? 0;
    if (now - lastUpdate < 15000) return;

    try {
      this.lastUpdateTime.set(channelId, now);
      await channel.setRateLimitPerUser(seconds, reason);
      this.logger.log(`Set slowmode for #${channel.name ?? channel.id} to ${seconds}s. Reason: ${reason}`, 'DiscordSlowmode');
    } catch (err) {
      const error = err as Error;
      this.logger.error(`Failed to set slowmode for #${channel.name ?? channel.id}: ${error.message}`, error.stack, 'DiscordSlowmode');
    }
  }

  private async resolveChannel(channelId: string): Promise<TextChannel | null> {
    if (!this.client) return null;

    const channel = this.client.channels.cache.get(channelId) ?? await this.client.channels.fetch(channelId).catch(() => null);
    return this.asSlowmodeChannel(channel as TextChannel | null);
  }

  private asSlowmodeChannel(channel: TextChannel | null): TextChannel | null {
    if (!channel || typeof channel.setRateLimitPerUser !== 'function') return null;
    return channel;
  }
}
