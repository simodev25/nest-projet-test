import { CanActivate, ExecutionContext, Injectable, Scope } from '@nestjs/common';
import { Observable } from 'rxjs';


export class HeadersService implements CanActivate {
  constructor(){
    console.log('TestService')
  }
  headers:any;
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

    this.headers = context.switchToHttp().getRequest().headers;
   // console.log(this)
    return true;
  }


  getHeader(){
    return  this.headers;
  }



}
