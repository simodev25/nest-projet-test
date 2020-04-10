import * as puppeteer from 'puppeteer';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { IRequest } from './i.request';
import { UrlRequestOptions } from './classes/url.request.Options';
import { from, Observable, of } from 'rxjs';
import { ScraperHelper } from './ScraperHelper';
import { ConfigService } from '@nestjs/config';



/**
 * Puppeteer Manager is a class that helps simplify the creation of any puppeteer request. Provides a good starting point to just launch puppeteer instances
 */
@Injectable()
export class PuppeteerManager implements IRequest, OnModuleDestroy {

  private browser: puppeteer.Browser | null;
  private isInit: boolean;
  private viewportOptions: puppeteer.Viewport;
  private pageNavigationOptions: puppeteer.NavigationOptions;
  private maxNavigationAttempts: number;
  private PUPPETEER_MANAGER_DEFAULT_LAUNCH_OPTIONS: puppeteer.LaunchOptions = {
    headless: true,
    devTools: false,
    executablePath: process.env.CHROMIUM_PATH,
    args: [
      // the following args are placed because this is what it took to get it working on my linux distrubition at the time.
      // should investigate to see if these are still needed.But for the purpose of web scraping or automating page request this should be fine
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--user-data-dir=PuppeteerBrowserCache',
      `--proxy-server=socks5://${this.configService.get('TOR_HOST')}:${this.configService.get('TOR_PORT')}`,
    ],
  };




  /**
   * Default configuration for the viewport of puppeteer
   */
  private PUPPETEER_MANAGER_DEFAULT_VIEWPORT: puppeteer.Viewport = {
    width: 1920,
    height: 1080,
    hasTouch: false,
    isLandscape: true,
    isMobile: false,
    deviceScaleFactor: 1,
  };

  /**
   * Basic navigation options that we are recommending
   */
  private PUPPETEER_MANAGER_DEFAULT_NAVIGATION: puppeteer.NavigationOptions = {
    waitUntil: 'networkidle2',
    timeout: 60000,
  };

  /**
   *
   * @param viewportOptions
   */
  constructor(private scraperHelper: ScraperHelper,
              private configService: ConfigService) {
    this.browser = null;
    this.isInit = false;
    this.viewportOptions = this.PUPPETEER_MANAGER_DEFAULT_VIEWPORT;
    this.pageNavigationOptions = this.PUPPETEER_MANAGER_DEFAULT_NAVIGATION;
    this.maxNavigationAttempts = 2;
    this.initialize().then();
  }

  /**
   * Launches the puppeteer browser with specific options
   * @param launchOptions
   */
  public initialize(
    launchOptions: puppeteer.LaunchOptions = this.PUPPETEER_MANAGER_DEFAULT_LAUNCH_OPTIONS,
  ): Promise<void> {
    return new Promise((resolve): void => {
      if (this.isInit) {
        resolve();
      } else {
        puppeteer.launch(launchOptions).then((browser: puppeteer.Browser): void => {
          this.browser = browser;
          this.isInit = true;
          resolve();
        });
      }
    });
  }

  run(urlRequestOptions: UrlRequestOptions): Observable<any> {
    let puppeteerRequest$ = null;


    if (this.browser === null) {
      puppeteerRequest$ = new Promise((resolve): void => {
        resolve(null);
      });
    } else {
      puppeteerRequest$ = new Promise(
        async (resolve, reject): Promise<void> => {
          // create the puppeteer page,configure and navigate to the designated web page
          let pupPage: puppeteer.Page = await (this.browser as puppeteer.Browser).newPage();
          await pupPage.setViewport(this.viewportOptions);
          try {
            pupPage = await this.attemptNavigation(pupPage, urlRequestOptions.url, []);

            resolve(pupPage);
          } catch (navigationError) {
            await pupPage.close();
            reject(navigationError);
          }
        },
      );
    }
    return from(puppeteerRequest$);
  }

  /**
   * Lets you know if this manager has been initialized
   */
  public isInitialized(): boolean {
    return this.isInit;
  }

  onModuleDestroy() {
    this.dispose();
  }

  /**
   * Closes the browser instance and frees up resources
   */
  public dispose(): Promise<void> {
    return new Promise((resolve): void => {
      if (this.browser === null) {
        resolve();
      } else {
        (this.browser as puppeteer.Browser)
          .close()
          .then((): void => {
            this.browser = null;
            resolve();
          })
          .catch((): void => {
            // this behavior will change in the future, for now there is nothing we can do about it
            resolve();
          });
      }
    });
  }

  /**
   * Attempt navigation to the page.Will attempt to retry if puppeteer encounters any navigation issues.
   * @param page The page instance we want to manipulate
   * @param url The url that we want our page to point towards
   * @param attempts The total amount of attempts and errors from those attempts
   */
  private attemptNavigation(page: puppeteer.Page, url: string, attempts: unknown[]): Promise<puppeteer.Page> {
    return new Promise(
      async (resolve, reject): Promise<void> => {
        try {
          await page.goto(url, this.pageNavigationOptions);
          const content = await page.content();
          resolve(content);
        } catch (navigationError) {
          attempts.push(navigationError);
          if (attempts.length < this.maxNavigationAttempts) {
            setTimeout(async (): Promise<void> => {
              page = await this.attemptNavigation(page, url, attempts);
              resolve(page);
            }, (this.pageNavigationOptions.timeout as number) + 1000);
          } else {
            reject(attempts);
          }
        }
      },
    );
  }

  /**
   * Open a new tab and then navigate to the specific url
   * @param pageUrl The url of the new page that we want to navigate to
   */
  public newPage(pageUrl: string): Promise<puppeteer.Page | null> {

    if (this.browser === null) {
      return new Promise((resolve): void => {
        resolve(null);
      });
    } else {
      return new Promise(
        async (resolve, reject): Promise<void> => {
          // create the puppeteer page,configure and navigate to the designated web page
          let pupPage: puppeteer.Page = await (this.browser as puppeteer.Browser).newPage();
          await pupPage.setViewport(this.viewportOptions);
          try {
            pupPage = await this.attemptNavigation(pupPage, pageUrl, []);

            resolve(pupPage);
          } catch (navigationError) {
            await pupPage.close();
            reject(navigationError);
          }
        },
      );
    }
  }
}
