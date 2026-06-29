import { Module } from '@nestjs/common';
import { SelfRolesModule } from '../self-roles/self-roles.module';
import { StickersModule } from '../stickers/stickers.module';
import { DiscordBotService } from './discord-bot.service';
import { DiscordInteractionService } from './discord-interaction.service';
import { DiscordPermissionService } from './discord-permission.service';
import { DiscordSlowmodeService } from './discord-slowmode.service';

@Module({
  imports: [SelfRolesModule, StickersModule],
  providers: [DiscordBotService, DiscordInteractionService, DiscordPermissionService, DiscordSlowmodeService],
  exports: [DiscordBotService, DiscordPermissionService, DiscordSlowmodeService],
})
export class DiscordModule {}
