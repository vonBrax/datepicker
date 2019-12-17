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
  // dayNamesShort: [
  //   'Sunday',
  //   'Monday',
  //   'Tuesday',
  //   'Wednesday',
  //   'Thursday',
  //   'Friday',
  //   'Saturday',
  // ],
  //onClose: removeAria
};
datepicker('#datepicker', options);
