import { Inject } from '@nestjs/common';

export const prefixesForLoggers: any[] = new Array<any>();

export function Logger(log: any) {

  if (!prefixesForLoggers.includes(log)) {
    prefixesForLoggers.push(log);
  }

  return Inject(`LoggerService${log.context}${log.prefix}`);
}
