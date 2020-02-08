import { Injectable } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as scrapeIt from 'scrape-it';
import { ScraperHelper } from '../ScraperHelper';
import { deleteSpace } from '../../shared/utils/shared.utils';

@Injectable()
export class ScraperMerchantwordsService {
  constructor(private readonly httpService: ProxyService) {
  }

  public scrapeUrlHome(link: string): Observable<any> {

    const result$ = this.httpService.get(link).pipe(
      map((res: any) => {
        const data: any = scrapeIt.scrapeHTML(res,
          {
            merchantwords: {
              selector: 'div.table__body',
              how: 'html',
              convert: (x: string) => {
                return this.getWordsSearchs(x);
              },
            }
            ,
          },
        );
        return data;
      }),
      map(data => {
        // console.log(data);
        return data['merchantwords'];
      }),
    );
    return result$;

  }

  private getWordsSearchs(contents: string): any {
    const wordsSearchs: any[] = [];
    if (contents != null) {

      let $: CheerioStatic = ScraperHelper.parseHtml(contents);

      const elements: CheerioElement[] = $('table#resultsTable tbody tr').toArray();

      elements.forEach(element => {
        const $tr = ScraperHelper.parseElement(element);
        if ($tr.root().text() !== '') {
          const $tds = $tr('td').toArray();
          const wordsSearch: any = {};
          const $tdWordsSearch = ScraperHelper.parseElement($tds[1]);
          const $tdVollume = ScraperHelper.parseElement($tds[2]);
          const $tdCategories = ScraperHelper.parseElement($tds[5]);

          wordsSearch.wordsSearch = this.getWordsSearch($tdWordsSearch.html());
          wordsSearch.vollume = $tdVollume.root().text().replace(/,/g, '');
          wordsSearch.categories = $tdCategories.root().text().split('&');
          wordsSearchs.push(wordsSearch);
        }

      });

    }

    return wordsSearchs;

  }

  private getWordsSearch(contents: string): string {
    const wordsSearch: string[] = [];
    if (contents != null) {
      let $: CheerioStatic = ScraperHelper.parseHtml(contents);

      const ratingElements: CheerioElement[] = $('span:nth-child(2) a').toArray();

      ratingElements.forEach((ratingElement) => {
        $ = ScraperHelper.parseElement(ratingElement);
        wordsSearch.push(deleteSpace($.root().text()));

      });

    }

    return wordsSearch.join(' ');

  }
}
