import { PluginFunc } from 'dayjs';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

interface PluginResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

// @ts-ignore
const plugin: PluginFunc = (option, Dayjs, dayjs) => {
  dayjs.duration = (timestamp: number): PluginResult => {
    const days = Math.floor(timestamp / DAY);
    const hours = Math.floor((timestamp % DAY) / HOUR);
    const minutes = Math.floor((timestamp % HOUR) / MINUTE);
    const seconds = Math.floor((timestamp % MINUTE) / SECOND);
    const milliseconds = Math.floor(timestamp % SECOND);
    return {
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
    };
  };
};

declare module 'dayjs' {
  export function duration(timestamp: number): any;
}

export default plugin;
