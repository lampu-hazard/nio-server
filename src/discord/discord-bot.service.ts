import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, Events, GatewayIntentBits, Partials, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { AppLogger } from '../logger/logger.service';
import { DiscordInteractionService } from './discord-interaction.service';

@Injectable()
export class DiscordBotService implements OnModuleInit {
  readonly client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.GuildMember],
    allowedMentions: { parse: [], users: [], roles: [], repliedUser: false },
  });

  constructor(
    private readonly interactions: DiscordInteractionService,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit() {
    const token = process.env.DISCORD_BOT_TOKEN;
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!token || !clientId) {
      this.logger.warn('DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID missing; Discord bot not started.', 'DiscordBot');
      return;
    }

    this.client.once(Events.ClientReady, () => this.logger.log(`Discord bot online as ${this.client.user?.tag}`, 'DiscordBot'));
    this.client.on('interactionCreate', (interaction) => this.interactions.handle(interaction).catch(
      (err) => this.logger.error(`Interaction error: ${err?.message ?? err}`, err?.stack, 'DiscordBot'),
    ));

    const commands = [
      new SlashCommandBuilder().setName('dashboard').setDescription('Open the nio dashboard').toJSON(),
    ];
    await new REST({ version: '10' }).setToken(token).put(Routes.applicationCommands(clientId), { body: commands });
    this.logger.log('Slash commands registered', 'DiscordBot');
    await this.client.login(token);
  }
}
