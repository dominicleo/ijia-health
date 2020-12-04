export default class CustomError extends Error {
  name = 'CustomError';
  constructor(message: string) {
    super(message);
    this.message = message || this.name;
  }

  static is<T extends typeof CustomError>(this: T, error: any): error is InstanceType<T> {
    return error instanceof this;
  }
}
