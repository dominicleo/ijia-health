import CustomError from './custom';

export default class AuthorizeError extends CustomError {
  name = 'AuthorizeError';
  redirect?: string;
  constructor(message: string, redirect?: string) {
    super(message);
    this.redirect = redirect;
  }

  static is(error: any): error is AuthorizeError {
    return error instanceof this;
  }
}
