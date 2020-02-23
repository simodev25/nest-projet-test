export class ScraperRequest {

  idRequest: string;
  createdAt: string;
  lastRequestAt: string;
  searchWord: string;
  link: string;
  methode: any;
  log: string[];

  constructor(searchWord: string) {
    this.createdAt = new Date().toISOString();
    this.searchWord = searchWord;

  }
}