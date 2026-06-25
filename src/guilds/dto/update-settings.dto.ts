import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  logChannelId?: string | null;

  @IsOptional()
  @IsBoolean()
  stickerEnabled?: boolean;
}
