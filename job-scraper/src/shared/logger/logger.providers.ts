import { prefixesForLoggers } from './logger.decorator';
import { Provider } from '@nestjs/common';
import { ScraperLoggerService } from './loggerService';
import * as winston from 'winston';

function loggerFactory(logger: ScraperLoggerService, log: any, injectkey: string) {
  const logger_: ScraperLoggerService = new ScraperLoggerService(logger.config, logger.redis);
  if (log.prefix) {
    logger_.setPrefix(log.prefix);
  }
  if (log.context) {
    logger_.setContext(log.context);
  }
  logger_.setInject(injectkey);

  logger_.setLogger((winston as any).createLogger(logger.loggerOptions(log.context)));
  return logger_;
}

function createLoggerProvider(log: any): Provider<ScraperLoggerService> {
  return {
    provide: `LoggerService${log.context}${log.prefix}`,
    useFactory: logger => loggerFactory(logger, log, `LoggerService${log.context}${log.prefix}`),
    inject: [ScraperLoggerService],
  };
}

export function createLoggerProviders(): Array<Provider<ScraperLoggerService>> {

  return prefixesForLoggers.map(log => createLoggerProvider(log));
}
