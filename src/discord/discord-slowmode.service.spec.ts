import { beforeEach, afterEach, describe, expect, it, jest } from '@jest/globals';
import { Message, TextChannel } from 'discord.js';
import { AppLogger } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { DiscordSlowmodeService } from './discord-slowmode.service';

describe('DiscordSlowmodeService', () => {
  let service: DiscordSlowmodeService;
  let prisma: any;
  let logger: any;

  const makeChannel = (rateLimitPerUser = 5) => ({
    id: 'channel-1',
    name: 'general',
    rateLimitPerUser,
    setRateLimitPerUser: jest.fn(async function (this: any, seconds: number) {
      this.rateLimitPerUser = seconds;
      return this;
    }),
  }) as unknown as TextChannel;

  const makeMessage = (channel: TextChannel) => ({
    guild: { id: 'guild-1' },
    channel,
    author: { bot: false },
  }) as unknown as Message;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    prisma = {
      guildSettings: {
        findMany: jest.fn(async () => []),
      },
    };
    logger = {
      log: jest.fn(),
      error: jest.fn(),
    };
    service = new DiscordSlowmodeService(
      prisma as unknown as PrismaService,
      logger as unknown as AppLogger,
    );
  });

  afterEach(() => {
    service.onModuleDestroy();
    jest.useRealTimers();
  });

  it('sets busy slowmode after 10 monitored messages in 10 seconds', async () => {
    const channel = makeChannel(5);
    const message = makeMessage(channel);

    service.updateGuildCache('guild-1', {
      slowmodeEnabled: true,
      slowmodeChannels: ['channel-1'],
      slowmodeIntervalQuiet: 5,
      slowmodeIntervalBusy: 10,
    });

    for (let i = 0; i < 10; i += 1) {
      await service.handleMessage(message);
    }

    expect(channel.setRateLimitPerUser).toHaveBeenCalledWith(10, 'Busy Chat Detected');
  });

  it('resets cached channels to quiet slowmode after inactivity', async () => {
    const channel = makeChannel(10);
    const message = makeMessage(channel);

    await service.onModuleInit();
    service.updateGuildCache('guild-1', {
      slowmodeEnabled: true,
      slowmodeChannels: ['channel-1'],
      slowmodeIntervalQuiet: 5,
      slowmodeIntervalBusy: 10,
    });

    await service.handleMessage(message);
    jest.advanceTimersByTime(45_000);
    await jest.runOnlyPendingTimersAsync();

    expect(channel.setRateLimitPerUser).toHaveBeenCalledWith(5, 'Inactivity Cooldown');
  });
});
