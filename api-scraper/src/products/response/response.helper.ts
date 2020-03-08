import { Injectable } from '@nestjs/common';
import { ApiRequestDto } from './api.request.dto';


@Injectable()
export class ResponseHelper {


  generateResponse(path: string, searchWord: string): ApiRequestDto {

    const response: ApiRequestDto = new ApiRequestDto(path, searchWord);
    return response;
  }
}
