import { datepicker } from './datepicker';

const options = {
  showOn: 'button',
  buttonImage: 'https://dequeuniversity.com/assets/images/calendar.png',
  buttonImageOnly: false,
  buttonText: 'Calendar View',
  showButtonPanel: true,
  buttonPanelOptions: {
    today: true,
    close: true,
  },
  gotoCurrent: true,
  closeText: 'Close',
  prevText: 'Previous Month',
  nextText: 'Next Month',
  changeMonth: false,
  changeYear: false,
  showOtherMonths: true,
  selectOtherMonths: false,
  showWeek: true,
  numberOfMonths: 3,
  showCurrentAtPos: 1,
  minDate: 1,
  maxDate: '+1M +10D',
  hideIfNoPrevNext: false,
  altField: '#datepickerclone',
  altFormat: 'yy-mm-dd',
  constrainInput: true,
  disabled: false,
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

// const dp = window.__quno__.datepicker;
const dp = datepicker('#datepicker', options);
// dp.regional.de = de;
dp.global.regional.de = de;
// dp.setDefaults(dp.regional.de);
dp.global.setDefaults(dp.global.regional.de);
// datepicker('#datepicker', 'option', dp.regional.de);
datepicker('#datepicker', 'option', dp.global.regional.de);
