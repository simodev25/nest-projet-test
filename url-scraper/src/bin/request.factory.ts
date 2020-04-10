import { Injectable } from '@nestjs/common';
import { RequesterType } from './enums/requesterType';
import { IRequest } from './i.request';
import { ModuleRef } from '@nestjs/core';
import { TorManager } from './tor.manager';
import { PuppeteerManager } from './puppeteer.manager';

@Injectable()
export class RequestFactory {

  constructor(private moduleRef: ModuleRef) {

  }

  public getManager(requesterType: RequesterType): IRequest {
    return this.moduleRef.get(TorManager);
    if (requesterType === RequesterType.REQUEST) {
      return this.moduleRef.get(TorManager);
    } else if (requesterType === RequesterType.TOR) {
      return this.moduleRef.get(TorManager);
    } else if (requesterType === RequesterType.PUPPETEER) {
      return this.moduleRef.get(PuppeteerManager);
    }

  }

}
