import CustomError from './custom';

export default class ServerError extends CustomError {
  name = 'ServerError';
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
