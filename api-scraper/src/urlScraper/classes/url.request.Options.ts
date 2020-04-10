import { RequesterType } from '../enums/requesterType';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export interface ScrapeOptions {
  [key: string]: string | ScrapeOptionList | ScrapeOptionElement;
}

export interface ScrapeOptionElement {
  selector?: string;
  how?: string;
  attr?: string;
  trim?: boolean;
  closest?: string;
  eq?: number;
  texteq?: number;
}

export interface ScrapeOptionList {
  listItem: string;
  data?: ScrapeOptions;

}

export class UrlRequestOptions {
  @ApiProperty({
    description: 'url  ',
    type: String,
  })
  @IsUrl({
    require_protocol: true,
    require_valid_protocol: true,
  })
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    enum: RequesterType, enumName: 'Requeste Type', default: RequesterType.TOR, example: 'TOR',
  })
  @IsNotEmpty({ message: `requesterType must be a valid enum ${Object.values(RequesterType)}` })
  @IsEnum(RequesterType, { message: `requesterType must be a valid enum ${Object.values(RequesterType)}` })
  requesterType: RequesterType;

  @ApiProperty({
    description: 'Scrape Options  ',
    type: Object,
  })
  @IsNotEmpty()
  scrapeOptions: ScrapeOptions;

  constructor(url, requesterModule: RequesterType) {
    this.url = url;
    this.requesterType = requesterModule;
  }


}
