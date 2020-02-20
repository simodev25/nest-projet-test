import { prefixesForLoggers } from './logger.decorator';
import { Provider } from '@nestjs/common';
import { LoggerServiceBase } from './loggerService';
import * as winston from 'winston';

function loggerFactory(logger: LoggerServiceBase, log: any, injectkey: string) {
  const logger_: LoggerServiceBase = new LoggerServiceBase();
  if (log.prefix) {
    logger_.setPrefix(log.prefix);
  }
  if (log.context) {
    logger_.setContext(log.context);
  }
  logger_.setInject(injectkey);

  logger_.setLogger((winston as any).createLogger(LoggerServiceBase.loggerOptions(log.context)));
  return logger_;
}

function createLoggerProvider(log: any): Provider<LoggerServiceBase> {
  return {
    provide: `LoggerService${log.context}${log.prefix}`,
    useFactory: logger => loggerFactory(logger, log, `LoggerService${log.context}${log.prefix}`),
    inject: [LoggerServiceBase],
  };
}

export function createLoggerProviders(): Array<Provider<LoggerServiceBase>> {
  console.log(prefixesForLoggers);
  return prefixesForLoggers.map(log => createLoggerProvider(log));
}
