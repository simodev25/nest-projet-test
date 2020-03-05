import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { format, Logger } from 'winston';
import * as path from 'path';
import * as chalk from 'chalk';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScraperLoggerService implements LoggerService {
  private prefix?: string;
  private context?: string;
  private inject?: string;
  private logger: Logger;


  constructor(private readonly configService: ConfigService) {

  }

  get config() {
    return this.configService;
  }

  get Logger(): any {
    return this.logger; // idk why i have this in my code !
  }

  log(message: string): void {
    this.logger.info(this.getMessage(message), this.context);
  }

  setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  setLogger(logger: Logger) {
    this.logger = logger;
  }

  setInject(inject: string) {
    this.inject = inject;
  }

  setContext(context: string) {
    this.context = context;
  }

  debug(message: any, context?: string): any {
    this.logger.debug(this.getMessage(message), this.context);
  }

  error(message: any, trace?: string, context?: string): any {
    this.logger.error(this.getMessage(message), this.context);
  }

  verbose(message: any, context?: string): any {
    this.logger.verbose(this.getMessage(message), this.context);
  }

  warn(message: any, context?: string): any {

    this.logger.warn(this.getMessage(message), this.context);
  }

  private getMessage(message: string): string {
    let formattedMessage = '';
    if (this.context) {
      formattedMessage = `[${this.context}]`;
    }
    if (this.prefix) {
      formattedMessage = formattedMessage.concat(`[${this.prefix}] `);
    }
    formattedMessage = formattedMessage.concat(` ${message}`);
    return formattedMessage;
  }

  public loggerOptions(context) {

    return {
      format: format.combine(
        format.colorize(),
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.label({ label: path.basename(process.mainModule.filename) }),
        format.printf(info => `${info.label} ${info.timestamp} ${info.level}: ${info.message}`),
      ),
      transports: [
        new winston.transports.Console({  level: process.env.LEVEL || 'debug'}),
        /*new winston.transports.File({
          level: 'debug',
          filename: `${this.configService.get('LOG_DIR')}${context}-debug.log `,

        }),
        new winston.transports.File({
          silent: process.env.NODE_ENV === 'production' ? true : false,
          level: 'info',
          filename: `${this.configService.get('LOG_DIR')}${context}-info.log `,

        }),
        new winston.transports.File({
            filename: `${this.configService.get('LOG_DIR')}${context}-error.log `,
            level: 'error',
          },
        ),*/
      ],
    };

  }



}
