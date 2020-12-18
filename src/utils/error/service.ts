import CustomError from './custom';

export default class ServiceError extends CustomError {
  name = 'ServiceError';
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }

  static is(error: any): error is ServiceError {
    return error instanceof this;
  }
}
