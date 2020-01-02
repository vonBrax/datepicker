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
  numberOfMonths: 1,
  showCurrentAtPos: 0,
  minDate: 1,
  maxDate: '+2M +15D',
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

function dateMeta(date) {
  const dayTime = 24 * 60 * 60 * 1000;
  const weekDay = date.getDay();
  const day = date.getTime();
  const today = new Date().getTime();
  const range = day - today;
  let cellClass = 'green';
  let text = '1+ spots';

  // Switch by range:
  if (range <= 7 * dayTime) {
    cellClass = 'red';
    text = '0 spots';
  } else if (range <= 12 * dayTime) {
    cellClass = 'yellow';
    text = '1 spot';
  }

  return [weekDay !== 0, cellClass, text];
}

const dp = datepicker('#datepicker', options);
dp.global.regional.de = de;
dp.global.setDefaults(dp.global.regional.de);
datepicker('#datepicker', 'option', dp.global.regional.de);
datepicker('#datepicker', 'option', 'beforeShowDay', dateMeta);
