import { stringToHashCode } from '../../shared/utils/shared.utils';
import { RequestMethod } from '../../shared/enums/response';
import { ApiProperty } from '@nestjs/swagger';

export class ApiRequestDto {
  @ApiProperty()
  idRequest: string;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  lastRequestAt: string;
  @ApiProperty()
  searchWord: string;
  @ApiProperty()
  link: string;
  @ApiProperty()
  methode: RequestMethod;
  @ApiProperty()
  logs: string[];

  constructor(path: string, searchWord: string) {
    this.createdAt = new Date().toISOString();
    this.idRequest = stringToHashCode(searchWord?.trim());
    this.searchWord = searchWord;
    this.link = `/api/v1/products/${path}/${this.idRequest}`;
    this.methode = RequestMethod.GET;
  }

  getIdRequest() {
    return this.idRequest;
  }

  initRequestAt() {
    this.lastRequestAt = new Date().toISOString();
  }

}
