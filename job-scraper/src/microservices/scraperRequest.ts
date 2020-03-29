export class ScraperRequest {

  idRequest: string;
  createdAt: string;
  lastRequestAt: string;
  searchWord: string;
  category: string;
  link: string;
  methode: any;
  logs: string[];

  constructor(searchWord: string, category: string = null) {
    this.createdAt = new Date().toISOString();
    this.searchWord = searchWord;
    this.category = category;
  }
}
