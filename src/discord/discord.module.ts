import { Module } from '@nestjs/common';
import { SelfRolesModule } from '../self-roles/self-roles.module';
import { DiscordBotService } from './discord-bot.service';
import { DiscordInteractionService } from './discord-interaction.service';
import { DiscordPermissionService } from './discord-permission.service';

@Module({
  imports: [SelfRolesModule],
  providers: [DiscordBotService, DiscordInteractionService, DiscordPermissionService],
  exports: [DiscordBotService, DiscordPermissionService],
})
export class DiscordModule {}
