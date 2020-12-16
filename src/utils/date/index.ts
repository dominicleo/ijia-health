import Dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import updateLocale from 'dayjs/plugin/updateLocale';
import duration from 'dayjs/plugin/duration';
import removeTimezone from './removeTimezone';
import 'dayjs/locale/zh-cn';

Dayjs.locale('zh-cn');
Dayjs.extend(removeTimezone);
Dayjs.extend(updateLocale);
Dayjs.extend(calendar);
Dayjs.extend(localizedFormat);
Dayjs.extend(duration);

Dayjs.updateLocale('zh-cn', {
  calendar: {
    sameDay: 'LT',
    nextDay: '[明天] LT',
    nextWeek: '[下] dddd LT',
    lastDay: '[昨天] LT',
    lastWeek: 'dddd LT',
    sameElse: 'L',
  },
});

const date = Dayjs;

export default date;
