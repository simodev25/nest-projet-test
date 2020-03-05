import { Injectable } from '@nestjs/common';
import { ScraperRequest } from './scraperRequest';

@Injectable()
export class ResponseHelper {


  generateResponse(path: string, searchWord: string): ScraperRequest {

    const response: ScraperRequest = new ScraperRequest(path, searchWord);
    return response;
  }
}
