import { IsBoolean, IsOptional, IsString, IsArray, IsInt, Min, Max } from 'class-validator';

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
  @IsInt()
  @Min(0)
  @Max(21600)
  slowmodeIntervalQuiet?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(21600)
  slowmodeIntervalBusy?: number;
}
