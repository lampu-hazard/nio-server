import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DiscordModule } from './discord/discord.module';
import { GuildsModule } from './guilds/guilds.module';
import { LoggerModule } from './logger/logger.module';
import { PanelsModule } from './panels/panels.module';
import { PrismaModule } from './prisma/prisma.module';
import { SelfRolesModule } from './self-roles/self-roles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    PrismaModule,
    AuthModule,
    DiscordModule,
    GuildsModule,
    PanelsModule,
    SelfRolesModule,
  ],
})
export class AppModule {}
