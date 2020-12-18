export default class CustomError extends Error {
  name = 'CustomError';
  constructor(message: string) {
    super(message);
    this.message = message || this.name;
  }
}
