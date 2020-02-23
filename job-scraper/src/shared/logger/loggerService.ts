import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { format, Logger } from 'winston';
import * as chalk from 'chalk';
import * as PrettyError from 'pretty-error';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'nestjs-redis';
import { from } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { deserialize, serialize } from 'class-transformer';
import { ScraperRequest } from '../../microservices/scraperRequest';
import {validator} from '../utils/shared.utils';
@Injectable()
export class ScraperLoggerService implements LoggerService {
  private prefix?: string;
  private context?: string;
  private idRequest?: string;
  private inject?: string;
  private logger: Logger;
  private readonly prettyError = new PrettyError();

  constructor(private readonly configService: ConfigService,
              private readonly redisClient: RedisService) {

  }

  get config() {
    return this.configService;
  }

  get redis() {
    return this.redisClient;
  }

  get Logger(): any {
    return this.logger; // idk why i have this in my code !
  }

  log(message: string, idRequest: string = null): void {
    const message$: string = this.getMessage(message);
    const response: any = this.redisClient.getClient().get(idRequest);
    from(response).pipe(filter((response$: any) => !!response$),
      map((response$: any) => {
        let response$$: ScraperRequest = deserialize(ScraperRequest, response$);
        if (response$$.idRequest == idRequest) {
          if (validator.isEmpty(response$$.log))
            response$$.log = [];
          response$$.log.push(message$);
        }
        return response$$;
      })).subscribe((response$$$: any) => {
      this.redisClient.getClient().set(idRequest, serialize(response$$$));
    });

    this.logger.info(message$, this.context, idRequest);
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
        format.label({ label: 'microservice' }),
        format.printf(info => `${info.label} ${info.timestamp} ${info.level}: ${info.message}`),
      ),
      transports: [
        new winston.transports.Console({ level: process.env.LEVEL || 'debug' }),
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

  // this method just for printing a cool log in your terminal , using chalk
  private formatedLog(level: string, message: string, error?): string {
    let result = '';
    const color = chalk.default;
    const currentDate = new Date();
    const time = `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;

    switch (level) {
      case 'info':
        result = `[${color.blue('INFO')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
          this.context,
        )}] ${message}`;
        break;
      case 'error':
        result = `[${color.red('ERR')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
          this.context,
        )}] ${message}`;
        if (error) {
          this.prettyError.render(error, true);
        }
        break;
      case 'warn':
        result = `[${color.yellow('WARN')}] ${color.dim.yellow.bold.underline(time)} [${color.green(
          this.context,
        )}] ${message}`;
        break;
      default:
        break;
    }
    return result;
  }

}
