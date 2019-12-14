import * as cheerio from 'cheerio';
import { EnumVariationType } from './lib/EScraper';

export class ScraperHelper {

  public static regex = /(https:)[A-Z0-9a-z-\.\/_]*(?:jpg|gif|png)/mg;

  public static parseHtml(contents: string): CheerioStatic {

    return cheerio.load(contents);
  }

  public static parseElement(element: CheerioElement): CheerioStatic {

    return cheerio.load(element, { ignoreWhitespace: true });
  }

  public static getTypeVariation(contents: string): EnumVariationType {
    if (contents) {
      const isColor = contents.match(/(color \d+(\.\d)*)/i);
      if (isColor) {
        return EnumVariationType.COLOR;
      }
      return EnumVariationType.COLOR;
    }
    return null;
  }

  public static getTextVariation(contents: string, deletText: string = ''): string {

    const text: string = contents.replace(deletText, '');

    return text;
  }

  public static getLinkVariationAmazone(contents: string, link: string = ''): string {
    if (contents === '') {
      return link;
    }
    const linkBase: string = link;
    const linkVariation = contents.slice(1);

    const linkReplace = linkBase.substring(linkBase.indexOf('dp'), linkBase.length);

    const text: string = linkBase.replace(linkReplace, linkVariation);

    return text;
  }

  public static getScript(contents: string, key: string): CheerioStatic {
    let $: CheerioStatic = ScraperHelper.parseHtml(contents);
    const scripts: CheerioElement[] = $('script').toArray();
    const cheerioStatic: CheerioStatic = scripts.map((script) => {
      $ = ScraperHelper.parseElement(script);
      return $;
    }).filter((script: CheerioStatic) => {
      return script.root().html().indexOf(key) > -1;
    })[0];

    return cheerioStatic;
  }

}
