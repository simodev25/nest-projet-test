import { isObject, isString } from '../utils/shared.utils';

export class Exception extends Error {
  public readonly message: any;

  constructor(
    private readonly response: string | object,
    private readonly status: string = '',
  ) {
    super();
    this.message = response;
  }

  public getResponse(): string | object {
    return this.response;
  }

  public getStatus(): string {
    return this.status;
  }

  public toString(): string {
    const message = this.getErrorString(this.message);
    return `Error: ${message}`;
  }

  private getErrorString(target: string | object): string | object {
    return isString(target) ? target : JSON.stringify(target);
  }

  public static createBody = (
    message: object | string,
    error?: string,
    code?: number,
  ) => {
    if (!message) {
      return { code, error };
    }
    return isObject(message) && !Array.isArray(message)
      ? message
      : { code, error, message };
  };
}
