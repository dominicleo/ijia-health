import { Dayjs, PluginFunc } from 'dayjs';

const plugin: PluginFunc = (option, Dayjs, dayjs) => {
  dayjs.removeTimezone = (value: string): Dayjs => {
    const config = typeof value === 'string' ? value.replace(/\.\d{3}\+\d{4}/, '') : value;
    return dayjs(config);
  };
};

declare module 'dayjs' {
  export function removeTimezone(timestamp: string): Dayjs;
}

export default plugin;
