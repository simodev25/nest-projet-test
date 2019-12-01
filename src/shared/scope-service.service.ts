import { Inject, Injectable, Scope , Request} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
require('zone.js/dist/zone-node');
require('zone.js/dist/zone-patch-rxjs');
declare var Zone: any;
@Injectable()
export class ScopeService {

  constructor() {
    Zone.current.get('requestContext')
  }

  private scopeRequestData: any;

  public setRequestContext(value: any) {
    Zone.current
      .fork({
        name: 'root', properties: {
          data: {
            value: 'initial',
          },
        },
      })
      .run(() => {
        console.log(Zone.current.get('data'));


      });
  }

  public  currentRequestContext(): any {
  return  Zone.current.get('data')
  }
}
