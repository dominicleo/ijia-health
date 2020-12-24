import 'dayjs/locale/zh-cn';

import Dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';
import duration from 'dayjs/plugin/duration';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import updateLocale from 'dayjs/plugin/updateLocale';

import removeTimezone from './removeTimezone';

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
