const env: string = process.env.REMAX_APP_ENV || 'production';

interface Env {
  production: string;
  test: string;
  development: string;
  [prop: string]: any;
}

const SERVICE_DOMAIN: Env = {
  production: 'https://api-gate.ijia120.com',
  stage: 'https://stage-api-gate.ijia120.com',
  test: 'https://hd-api-gate.ijia120.com',
  development: 'https://dev-api-gate.ijia120.com',
};

const FRONTEND_DOMAIN: Env = {
  production: 'https://m.ijia120.com',
  stage: 'https://stage-m.ijia120.com',
  test: 'http://hd-m.ijia120.com',
  development: 'https://dev-m.ijia120.com',
};

const SOCKET_DOMAIN: Env = {
  production: 'wss://api-gate.ijia120.com/api/ws/event',
  stage: 'wss://stage-api-gate.ijia120.com/',
  test: 'wss://hd-api-gate.ijia120.com/api/ws/event',
  development: 'wss://dev-api-gate.ijia120.com/api/ws/event',
};

export const SERVICE_URL = SERVICE_DOMAIN[env] || SERVICE_DOMAIN.production;

export const FRONTEND_URL = FRONTEND_DOMAIN[env] || FRONTEND_DOMAIN.production;

export const SOCKET_URL = SOCKET_DOMAIN[env] || SOCKET_DOMAIN.production;
