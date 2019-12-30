import { datepicker } from './datepicker';

const options = {
  showOn: 'button',
  buttonImage: 'https://dequeuniversity.com/assets/images/calendar.png',
  buttonImageOnly: false,
  buttonText: 'Calendar View',
  showButtonPanel: true,
  buttonPanelOptions: {
    today: false,
    close: true,
  },
  closeText: 'Close',
  prevText: 'Previous Month',
  nextText: 'Next Month',
  changeMonth: false,
  changeYear: false,
};

const de = {
  closeText: 'Schließen',
  prevText: 'vorheriger Monat',
  nextText: 'Nächsten Monat',
  currentText: 'Heute',
  monthNames: [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mär',
    'Apr',
    'Mai',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Okt',
    'Nov',
    'Dez',
  ],
  dayNames: [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ],
  dayNamesShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  dayNamesMin: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  weekHeader: 'KW',
  dateFormat: 'dd.mm.yy',
  firstDay: 1,
  isRTL: false,
  showMonthAfterYear: false,
  yearSuffix: '',
};

datepicker('#datepicker', options);
const dp = window.__quno__.datepicker;
dp.regional.de = de;
dp.setDefaults(dp.regional.de);
datepicker('#datepicker', 'option', dp.regional.de);
