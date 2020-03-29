import * as puppeteer from 'puppeteer';
import { Injectable } from '@nestjs/common';

/**
 * Default launch options for puppeteer
 */
export const PUPPETEER_MANAGER_DEFAULT_LAUNCH_OPTIONS: puppeteer.LaunchOptions = {
  headless: true,
  args: [
    // the following args are placed because this is what it took to get it working on my linux distrubition at the time.
    // should investigate to see if these are still needed.But for the purpose of web scraping or automating page request this should be fine
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--user-data-dir=PuppeteerBrowserCache',
  ],
};

/**
 * Default configuration for the viewport of puppeteer
 */
export const PUPPETEER_MANAGER_DEFAULT_VIEWPORT: puppeteer.Viewport = {
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
export const PUPPETEER_MANAGER_DEFAULT_NAVIGATION: puppeteer.NavigationOptions = {
  waitUntil: 'networkidle2',
  timeout: 60000,
};

/**
 * Puppeteer Manager is a class that helps simplify the creation of any puppeteer request. Provides a good starting point to just launch puppeteer instances
 */
@Injectable()
export class PuppeteerManager {
  protected browser: puppeteer.Browser | null;
  protected isInit: boolean;
  protected viewportOptions: puppeteer.Viewport;
  protected pageNavigationOptions: puppeteer.NavigationOptions;
  protected maxNavigationAttempts: number;

  /**
   *
   * @param viewportOptions
   */
  public constructor() {
    this.browser = null;
    this.isInit = false;
    this.viewportOptions = PUPPETEER_MANAGER_DEFAULT_VIEWPORT;
    this.pageNavigationOptions = PUPPETEER_MANAGER_DEFAULT_NAVIGATION;
    this.maxNavigationAttempts = 2;
  }

  /**
   * Launches the puppeteer browser with specific options
   * @param launchOptions
   */
  public initialize(
    launchOptions: puppeteer.LaunchOptions = PUPPETEER_MANAGER_DEFAULT_LAUNCH_OPTIONS,
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

  /**
   * Lets you know if this manager has been initialized
   */
  public isInitialized(): boolean {
    return this.isInit;
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
          resolve(page);
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
            console.log(pupPage)
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

