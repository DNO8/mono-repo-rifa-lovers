import { IsString, MaxLength, MinLength } from 'class-validator'

export class SendCampaignDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  subject: string

  @IsString()
  @MinLength(1)
  body: string
}
