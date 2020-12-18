import CustomError from './custom';

export default class NetworkError extends CustomError {
  name = 'NetworkError';

  static is(error: any): error is NetworkError {
    return error instanceof this;
  }
}
