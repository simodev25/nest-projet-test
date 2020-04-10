import { Injectable } from '@nestjs/common';
import { RequesterModule } from './enums/requester.module';
import { IRequest } from './i.request';
import { ModuleRef } from '@nestjs/core';
import { RequestManager } from './request.manager';
import { TorManager } from './tor.manager';
import { PuppeteerManager } from './puppeteer.manager';

@Injectable()
export class RequestFactory {

  constructor(private moduleRef: ModuleRef) {

  }

  public getManager(requesterModule: RequesterModule): IRequest {
    if (requesterModule === RequesterModule.REQUEST) {
      return this.moduleRef.get(TorManager);
    } else if (requesterModule === RequesterModule.TOR) {
      return this.moduleRef.get(TorManager);
    } else if (requesterModule === RequesterModule.PUPPETEER) {
      return this.moduleRef.get(PuppeteerManager);
    }

  }

}
