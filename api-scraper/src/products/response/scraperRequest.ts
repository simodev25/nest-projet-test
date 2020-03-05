import { stringToHashCode } from '../../shared/utils/shared.utils';
import { RequestMethod } from '../../shared/enums/response';

export class ScraperRequest {

  idRequest: string;
  createdAt: string;
  lastRequestAt: string;
  searchWord: string;
  link: string;
  methode: RequestMethod;
  log: string[];

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
