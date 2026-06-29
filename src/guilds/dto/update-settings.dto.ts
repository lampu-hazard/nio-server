import { IsBoolean, IsOptional, IsString, IsArray, IsNumber } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  logChannelId?: string | null;

  @IsOptional()
  @IsBoolean()
  stickerEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  slowmodeEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  slowmodeChannels?: string[];

  @IsOptional()
  @IsNumber()
  slowmodeIntervalQuiet?: number;

  @IsOptional()
  @IsNumber()
  slowmodeIntervalBusy?: number;
}
