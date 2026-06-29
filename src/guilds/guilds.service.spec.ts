import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import { GuildsService } from './guilds.service';
import { DiscordBotService } from '../discord/discord-bot.service';
import { PrismaService } from '../prisma/prisma.service';
import { DiscordSlowmodeService } from '../discord/discord-slowmode.service';
import { StickersService } from '../stickers/stickers.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

describe('GuildsService', () => {
  let service: GuildsService;
  let bot: any;
  let prisma: any;
  let stickers: any;
  let slowmode: any;

  beforeEach(() => {
    bot = {
      client: {
        guilds: {
          cache: {
            has: jest.fn(),
            get: jest.fn(),
          },
        },
      },
    };

    prisma = {
      guildSettings: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    stickers = {
      setEnabled: jest.fn(),
    };

    slowmode = {
      updateGuildCache: jest.fn(),
    };

    service = new GuildsService(
      bot as unknown as DiscordBotService,
      prisma as unknown as PrismaService,
      stickers as unknown as StickersService,
      slowmode as unknown as DiscordSlowmodeService,
    );
  });

  describe('getSettings', () => {
    it('returns default settings when guild settings do not exist', async () => {
      prisma.guildSettings.findUnique.mockResolvedValue(null);

      const result = await service.getSettings('guild-1');

      expect(prisma.guildSettings.findUnique).toHaveBeenCalledWith({
        where: { guildId: 'guild-1' },
      });
      expect(result).toEqual({
        logChannelId: null,
        stickerEnabled: false,
        slowmodeEnabled: false,
        slowmodeChannels: [],
        slowmodeIntervalQuiet: 5,
        slowmodeIntervalBusy: 10,
      });
    });

    it('returns stored settings when guild settings exist', async () => {
      const mockSettings = {
        guildId: 'guild-1',
        logChannelId: 'channel-1',
        stickerEnabled: true,
        slowmodeEnabled: true,
        slowmodeChannels: ['channel-2'],
        slowmodeIntervalQuiet: 15,
        slowmodeIntervalBusy: 30,
      };
      prisma.guildSettings.findUnique.mockResolvedValue(mockSettings);

      const result = await service.getSettings('guild-1');

      expect(prisma.guildSettings.findUnique).toHaveBeenCalledWith({
        where: { guildId: 'guild-1' },
      });
      expect(result).toEqual({
        logChannelId: 'channel-1',
        stickerEnabled: true,
        slowmodeEnabled: true,
        slowmodeChannels: ['channel-2'],
        slowmodeIntervalQuiet: 15,
        slowmodeIntervalBusy: 30,
      });
    });
  });

  describe('updateSettings', () => {
    it('updates slowmode settings and returns the updated guild settings', async () => {
      const dto: UpdateSettingsDto = {
        slowmodeEnabled: true,
        slowmodeChannels: ['channel-3'],
        slowmodeIntervalQuiet: 20,
        slowmodeIntervalBusy: 40,
      };

      const mockUpdated = {
        guildId: 'guild-1',
        logChannelId: null,
        stickerEnabled: false,
        slowmodeEnabled: true,
        slowmodeChannels: ['channel-3'],
        slowmodeIntervalQuiet: 20,
        slowmodeIntervalBusy: 40,
      };

      prisma.guildSettings.upsert.mockResolvedValue(mockUpdated);

      const result = await service.updateSettings('guild-1', dto);

      expect(prisma.guildSettings.upsert).toHaveBeenCalledWith({
        where: { guildId: 'guild-1' },
        update: {
          logChannelId: undefined,
          stickerEnabled: undefined,
          slowmodeEnabled: true,
          slowmodeChannels: ['channel-3'],
          slowmodeIntervalQuiet: 20,
          slowmodeIntervalBusy: 40,
        },
        create: {
          guildId: 'guild-1',
          logChannelId: null,
          stickerEnabled: false,
          slowmodeEnabled: true,
          slowmodeChannels: ['channel-3'],
          slowmodeIntervalQuiet: 20,
          slowmodeIntervalBusy: 40,
        },
      });
      expect(result).toEqual(mockUpdated);
      expect(stickers.setEnabled).not.toHaveBeenCalled();
      expect(slowmode.updateGuildCache).toHaveBeenCalledWith('guild-1', {
        slowmodeEnabled: true,
        slowmodeChannels: ['channel-3'],
        slowmodeIntervalQuiet: 20,
        slowmodeIntervalBusy: 40,
      });
    });

    it('triggers stickers setEnabled if stickerEnabled is updated', async () => {
      const dto: UpdateSettingsDto = {
        stickerEnabled: true,
      };

      const mockUpdated = {
        guildId: 'guild-1',
        logChannelId: null,
        stickerEnabled: true,
        slowmodeEnabled: false,
        slowmodeChannels: [],
        slowmodeIntervalQuiet: 5,
        slowmodeIntervalBusy: 10,
      };

      prisma.guildSettings.upsert.mockResolvedValue(mockUpdated);

      const result = await service.updateSettings('guild-1', dto);

      expect(prisma.guildSettings.upsert).toHaveBeenCalledWith({
        where: { guildId: 'guild-1' },
        update: {
          logChannelId: undefined,
          stickerEnabled: true,
          slowmodeEnabled: undefined,
          slowmodeChannels: undefined,
          slowmodeIntervalQuiet: undefined,
          slowmodeIntervalBusy: undefined,
        },
        create: {
          guildId: 'guild-1',
          logChannelId: null,
          stickerEnabled: true,
          slowmodeEnabled: false,
          slowmodeChannels: [],
          slowmodeIntervalQuiet: 5,
          slowmodeIntervalBusy: 10,
        },
      });
      expect(result).toEqual(mockUpdated);
      expect(stickers.setEnabled).toHaveBeenCalledWith('guild-1', true);
      expect(slowmode.updateGuildCache).toHaveBeenCalledWith('guild-1', {
        slowmodeEnabled: false,
        slowmodeChannels: [],
        slowmodeIntervalQuiet: 5,
        slowmodeIntervalBusy: 10,
      });
    });
  });
});