import {
  TerminusEndpoint,
  TerminusOptionsFactory,
  DNSHealthIndicator,
  TerminusModuleOptions,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { AppHealthIndicator } from './app.health.Indicator';


@Injectable()
export class TerminusOptionsService implements TerminusOptionsFactory {
  constructor(
    private readonly appHealthIndicator: AppHealthIndicator,
  ) {
  }

  createTerminusOptions(): TerminusModuleOptions {
    const healthEndpoint: TerminusEndpoint = {
      url: '/api/health',
      healthIndicators: [
        async () => this.appHealthIndicator.ishealth(),

      ],

    };

    return {
      endpoints: [healthEndpoint],
    };
  }
}
