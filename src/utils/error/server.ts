import { AxiosResponse } from 'axios';
import CustomError from './custom';

export default class ServerError extends CustomError {
  name = 'ServerError';
  response: AxiosResponse;
  constructor(message: string, response: AxiosResponse) {
    super(message);
    this.response = response;
  }

  static is(error: any): error is ServerError {
    return error instanceof this;
  }
}
