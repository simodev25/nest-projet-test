import { Injectable } from '@nestjs/common';
import {
  DNSHealthIndicator,
  HealthIndicator,
  HealthIndicatorResult,
  MicroserviceHealthIndicator,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { of, zip } from 'rxjs';
import { Transport } from '@nestjs/microservices';
import { map } from 'rxjs/operators';
import { HealthCheckError } from '@godaddy/terminus';

enum StateType {

  'SERVER_IS_NOT_READY' = 'SERVER_IS_NOT_READY',
  'SERVER_IS_NOT_SHUTTING_DOWN' = 'SERVER_IS_NOT_SHUTTING_DOWN',
  'SERVER_IS_READY' = 'SERVER_IS_READY',
  'SERVER_IS_SHUTTING_DOWN' = 'SERVER_IS_SHUTTING_DOWN',

}

@Injectable()
export class AppHealthIndicator extends HealthIndicator {

  private serverIsShuttingDown: boolean;
  private serverIsReady: boolean;


  constructor(private configService: ConfigService,
              private readonly dns: DNSHealthIndicator,
              private  microservice: MicroserviceHealthIndicator,
              private mongooseHealthIndicator: MongooseHealthIndicator) {
    super();

  }

  async ishealth(): Promise<HealthIndicatorResult> {

    const healthIndicators = of('health');

    return healthIndicators.pipe(map((key: string) => {

        let stateType: StateType;
        let isdown$: boolean = true;
        if (this.serverIsShuttingDown) {
          stateType = StateType.SERVER_IS_SHUTTING_DOWN;
        } else if (this.serverIsReady) {
          isdown$ = true;

          stateType = StateType.SERVER_IS_READY;
        } else {
          isdown$ = true;

          stateType = StateType.SERVER_IS_NOT_READY;
        }

        const result$ = this.getStatus(key, isdown$, { stateType });

        if (isdown$) {
          return result$;
        }
        throw new HealthCheckError('app failed', result$);
      }),
    ).toPromise();
  }

  async isHealthyAmqp(): Promise<HealthIndicatorResult> {

    const healthIndicators = zip(this.microservice.pingCheck('amqp', {
        transport: Transport.RMQ,
        options: {
          urls: [this.configService.get<string>('AMQP_URL')],
        },
      }),
    );

    return healthIndicators.pipe(map((checks$: HealthIndicatorResult[]) => {
        const checks = {};
        checks$.forEach((check: HealthIndicatorResult) => {
          checks[(Object.keys(check)[0])] = Object.values(check)[0];
        });
        const isdown$ = checks$.map((check: HealthIndicatorResult) => Object.values(check)[0].status !== 'up').length > 0;
        const result$ = this.getStatus('amqp', isdown$, { checks });

        if (isdown$) {
          return result$;
        }

      }),
    ).toPromise();
  }


  async isHealthyRedis(): Promise<HealthIndicatorResult> {

    const healthIndicators = zip(
      this.microservice.pingCheck('redis', {
        transport: Transport.REDIS,
        options: {
          url: this.configService.get<string>('REDIS_URL'),
        },
      }),
    );

    return healthIndicators.pipe(map((checks$: HealthIndicatorResult[]) => {
        const checks = {};
        checks$.forEach((check: HealthIndicatorResult) => {
          checks[(Object.keys(check)[0])] = Object.values(check)[0];
        });
        const isdown$ = checks$.map((check: HealthIndicatorResult) => Object.values(check)[0].status !== 'up').length > 0;
        const result$ = this.getStatus('redis', isdown$, { checks });

        if (isdown$) {
          return result$;
        }

      }),
    ).toPromise();
  }

  async isHealthyMongo(): Promise<HealthIndicatorResult> {

    const healthIndicators = zip(
      this.mongooseHealthIndicator.pingCheck('mongoose', {
        connection: this.configService.get<string>('MONGODB_URI'),

      }),
    );

    return healthIndicators.pipe(map((checks$: HealthIndicatorResult[]) => {
        const checks = {};
        checks$.forEach((check: HealthIndicatorResult) => {
          checks[(Object.keys(check)[0])] = Object.values(check)[0];
        });
        const isdown$ = checks$.map((check: HealthIndicatorResult) => Object.values(check)[0].status !== 'up').length > 0;
        const result$ = this.getStatus('mongoose', isdown$, { checks });

        if (isdown$) {
          return result$;
        }

      }),
    ).toPromise();
  }

}

