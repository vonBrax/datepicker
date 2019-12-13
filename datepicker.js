// ===================================================================
// Source code adapted (vanilla) from jQuery UI Datepicker:
// https://github.com/jquery/jquery-ui/blob/master/ui/widgets/datepicker.js
// Dependencies: jQuery, jQuery UI
// ===================================================================

let datepicker_instActive;

// Date picker manager.
// Use the singleton instance of this class, $.datepicker, to interact with the date picker.
// Settings for (groups of) date pickers are maintained in an instance object,
// allowing multiple different settings on the same page.
function DatePicker() {
  // The current instance in use
  this.curInst = null;
  // If the last event was a key event
  this.keyEvent = false;
  // List of date picker inputs that have been disabled
  this.disabledInput = [];
  // True if the popup picker is showing , false if not
  this.datePickerShowing = false;
  // True if showing within a "dialog", false if not
  this.inDialog = false;
  // The ID of the main datepicker division
  this.mainDivId = 'ui-datepicker-div';
  // The name of the inline marker class
  this.inlineClass = 'ui-datepicker-inline';
  // The name of the append marker class
  this.appendClass = 'ui-datepicker-append';
  // The name of the trigger marker class
  this.triggerClass = 'ui-datepicker-trigger';
  // The name of the dialog marker class
  this.dialogClass = 'ui-datepicker-dialog';
  // The name of the disabled covering marker class
  this.disableClass = 'ui-datepicker-disabled';
  // The name of the unselectable cell marker class
  this.unselectableClass = 'ui-datepicker-unselectable';
  // The name of the current day marker class
  this.currentClass = 'ui-datepicker-current-day';
  // The name of the day hover marker class
  this.dayOverClass = 'ui-datepicker-days-cell-over';
  // Available regional settings, indexed by language code
  this.regional = [];
  // Default regional settings
  this.regional[''] = {
    closeText: 'Done',
    prevText: 'Prev',
    nextText: 'Next',
    currentText: 'Today',
    monthNames: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    monthNamesShort: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    dayNames: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    weekHeader: 'Wk',
    dateFormat: 'mm/dd/yy',
    firstDay: 0,
    isRTL: false,
    // True if the year select precedes month, false for month then year
    showMonthAfterYear: false,
    // Additional text to append to the year in the month headers
    yearSuffix: '',
  };

  this.defaults = {
    // "focus" for popup on focus, "button" for trigger button, or "both" for either
    showOn: 'focus',
    // Name of jQuery animation for popup
    showAnim: 'fadeIn',
    // Options for enhanced animations
    showOptions: {},
    // Used when field is blank: actual date, +/-number for offset from today, null for today
    defaultDate: null,
    // Display text following the input box, e.g. showing the format
    appendText: '',
    // Text for trigger button
    buttonText: '...',
    // URL for trigger button image
    buttonImage: '',
    // True if the image appears alone, false if it appears on a button
    buttonImageOnly: false,
    // True to hide next/previous month links. If not applicable, false to just disable them
    hideIfNoPrevNext: false,
    // True if date formatting applied to prev/today/next links
    navigationAsDateFormat: false,
    // True if today link goes back to current selection instead
    gotoCurrent: false,
    // True if month can be selected directly, false if only prev/next
    changeMonth: false,
    // True if year can be selected directly, false if only prev/next
    changeYear: false,
    // Range of years to display in drop-down,
    // either relative to today's year (-nn:+nn), relative to currently displayed year
    // (c-nn:c+nn), absolute (nnnn:nnnn), or a combination of the above (nnnn:-n)
    yearRange: 'c-10:c+10',
    // True to show dates in other months, false to leave blank
    showOtherMonths: false,
    // True to allow selection of dates in other months, false for unselectable
    selectOtherMonths: false,
    // True to show week of the year, false to not show it
    showWeek: false,
    // How to calculate the week of the year,
    // takes a Date and returns the number of the week for it
    calculateWeek: this.iso8601Week,
    // Short year values < this are in the current century,
    // > this are in the previous century,
    // string value starting with "+" for current year + value
    shortYearCutoff: '+10',
    // The earliest selectable date, or null for no limit
    minDate: null,
    // The latest selectable date, or null for no limit
    maxDate: null,
    // Duration of display/closure
    duration: 'fast',
    // Function that takes a date and returns an array with
    // [0] = true if selectable, false if not, [1] = custom CSS class name(s) or "",
    // [2] = cell title (optional), e.g. datepicker.noWeekends
    beforeShowDay: null,
    // Function that takes an input field and
    // returns a set of custom settings for the date picker
    beforeShow: null,
    // Define a callback function when a date is selected
    onSelect: null,
    // Define a callback function when the month or year is changed
    onChangeMonthYear: null,
    // Define a callback function when the datepicker is closed
    onClose: null,
    // Number of months to show at a time
    numberOfMonths: 1,
    // The position in multipe months at which to show the current month (starting at 0)
    showCurrentAtPos: 0,
    // Number of months to step back/forward
    stepMonths: 1,
    // Number of months to step back/forward for the big links
    stepBigMonths: 12,
    // Selector for an alternate field to store selected dates into
    altField: '',
    // The date format to use for the alternate field
    altFormat: '',
    // The input is constrained by the current date format
    constrainInput: true,
    // True to show button panel, false to not show it
    showButtonPanel: false,
    // True to size the input for the date format, false to leave as is
    autoSize: false,
    // The initial disabled state
    disabled: false,
  };

  this.defaults = Object.assign(this.defaults, this.regional['']);
  this.regional.en = JSON.parse(JSON.stringify(this.regional['']));
  this.regional['en-US'] = JSON.parse(JSON.stringify(this.regional['']));
  // const html = `<div id="${this._mainDivId}" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>`;
  const div = document.createElement('div');
  div.setAttribute('id', this.mainDivId);
  div.setAttribute(
    'class',
    'ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all',
  );
  this.dpDiv = datepicker_bindHover(div);
}

/* Attach the date picker to a jQuery selection.
 * @param  target	element - the target input field or division or span
 * @param  settings  object - the new settings to use for this date picker instance (anonymous)
 */
function attachDatepicker(target, settings) {
  const nodeName = target.nodeName.toLowerCase();
  const inline = nodeName === 'div' || nodeName === 'span';
  if (!target.id) {
    this.uuid += 1;
    target.id = 'dp' + this.uuid;
  }
  const inst = this.newInst(target, inline);
  inst.settings = Object.assign({}, settings);

  if (nodeName === 'input') {
    this.connectDatepicker(target, inst);
  } else if (inline) {
    this.inlineDatepicker(target, inst);
  }
}

/* Create a new instance object. */
function newInst(target, inline) {
  // escape jQuery meta chars
  const id = target.id.replace(/([^A-Za-z0-9_-])/g, '\\\\$1');
  const div = document.createElement('div');
  div.setAttribute(
    'class',
    `${this.inlineClass} ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all`,
  );
  // const html = `<div class="${this.inlineClass} ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>`;
  return {
    id,
    input: target,
    selectedDay: 0,
    selectedMonth: 0,
    selectedYear: 0,
    drawMonth: 0,
    drawYear: 0,
    inline,
    dpDiv: !inline ? this.dpDiv : datepicker_bindHover(div),
  };
}

/* Attach the date picker to an input field. */
function connectDatepicker(target, inst) {
  inst.append = [];
  inst.trigger = [];
  if (target.classList.contains(this.markerClassName)) {
    return;
  }

  this.attachments(target, inst);
  target.classList.add(this.markerClassName);
  target.addEventListener('keydown', this.doKeyDown);
  target.addEventListener('keypress', this.doKeyPress);
  target.addEventListener('keyup', this.doKeyUp);
  this.autoSize(inst);
  target.datepicker = inst;

  // If disabled option is true, disable the datepicker once it has been attached to the input (see ticket #5665)
  if (inst.settings.disabled) {
    this.disableDatepicker(target);
  }
}

/* Make attachments based on settings. */
function attachments(input, inst) {
  const appendText = this.get(inst, 'appendText');
  const isRTL = this.get(inst, 'isRTL');

  if (inst.append) {
    /**
     * @todo: REVIEW
     */
    inst.append.remove();
  }

  if (appendText) {
    /**
     * @todo: REVIEW
     */
    const span = document.createElement('span');
    span.setAttribute('class', this.appendClass);
    span.innerText = appendText;
    inst.append = span;
    input.insertAdjacentElement(
      isRTL ? 'beforebegin' : 'afterend',
      inst.append,
    );
  }

  input.removeEventListener('focus', this.showDatePicker);

  if (inst.trigger) {
    /**
     * @todo: REVIEW
     */
    inst.trigger.remove();
  }

  const showOn = this.get(inst, 'showOn');

  if (showOn === 'focus' || showOn === 'both') {
    input.addEventListener('focus', this.showDatePicker);
  }
  if (showOn === 'button' || showOn === 'both') {
    const buttonText = this.get(inst, 'buttonText');
    const buttonImage = this.get(inst, 'buttonImage');

    const img = document.createElement('img');
    img.setAttribute('src', buttonImage);
    img.setAttribute('alt', buttonText);
    img.setAttribute('title', buttonText);
    if (this.get(inst, 'buttonImageOnly')) {
      img.setAttribute('class', this.triggerClass);
      inst.trigger = img;
    } else {
      const btn = document.createElement('btn');
      btn.setAttribute('type', 'button');
      btn.setAttribute('class', this.triggerClass);
      if (buttonImage) {
        btn.appendChild(img);
      } else {
        btn.innerText = buttonText;
      }
      inst.trigger = btn;
    }

    input.insertAdjacentElement(
      isRTL ? 'beforebegin' : 'afterend',
      inst.trigger,
    );
    inst.trigger.addEventListener('click', () => {
      if (DatePicker.datepickerShowing && DatePicker.lastInput === input) {
        DatePicker.hideDatepicker();
      } else if (DatePicker.datepickerShowing) {
        DatePicker.hideDatepicker();
        DatePicker.showDatePicker(input);
      } else {
        DatePicker.showDatePicker(input);
      }

      return false;
    });
  }
}

function get(inst, name) {
  return inst.settings[name] !== undefined
    ? this.settings[name]
    : this._defaults[name];
}

function autoSize(inst) {
  // Ensure double digits
  const date = new Date(2009, 12 - 1, 20);
  if (this.get(inst, 'autoSize') && !inst.inline) {
    const dateFormat = this.get(inst, 'dateFormat');

    if (dateFormat.match(/[DM]/)) {
      const findMax = names => {
        let max = 0;
        let maxI = 0;

        names.forEach((name, i) => {
          if (name.length > max) {
            max = name.length;
            maxI = i;
          }
        });

        return maxI;
      };
      const monthFormat = dateFormat.match(/MM/)
        ? 'monthNames'
        : 'monthNamesShort';
      date.setMonth(findMax(this.get(inst, monthFormat)));
      const dayFormat = dateFormat.match(/DD/) ? 'dayNames' : 'dayNamesShort';
      date.setDate(findMax(this.get(inst, dayFormat)));
    }
  }

  inst.input.setAttribute('size', this._formatDate(inst, date));
}

/* Format the given date for display. */
function _formatDate(inst, day, month, year) {
  if (!day) {
    inst.currentDay = inst.selectedDay;
    inst.currentMonth = inst.selectedMonth;
    inst.currentYear = inst.selectedYear;
  }

  const date = day
    ? typeof day === 'object'
      ? day
      : this.daylightSavingAdjust(new Date(year, month, day))
    : this.daylightSavingAdjust(
        new Date(inst.currentYear, inst.currentMonth, inst.currentDay),
      );

  return this.formatDate(
    this.get(inst, 'dateFormat'),
    date,
    this.getFormatConfig(inst),
  );
}

function daylightSavingAdjust(date) {
  if (!date) {
    return null;
  }

  date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
  return date;
}

/* Format a date object into a string value.
 * The format can be combinations of the following:
 * d  - day of month (no leading zero)
 * dd - day of month (two digit)
 * o  - day of year (no leading zeros)
 * oo - day of year (three digit)
 * D  - day name short
 * DD - day name long
 * m  - month of year (no leading zero)
 * mm - month of year (two digit)
 * M  - month name short
 * MM - month name long
 * y  - year (two digit)
 * yy - year (four digit)
 * @ - Unix timestamp (ms since 01/01/1970)
 * ! - Windows ticks (100ns since 01/01/0001)
 * "..." - literal text
 * '' - single quote
 *
 * @param  format string - the desired format of the date
 * @param  date Date - the date value to format
 * @param  settings Object - attributes include:
 *          dayNamesShort	string[7] - abbreviated names of the days from Sunday (optional)
 *          dayNames    string[7] - names of the days from Sunday (optional)
 *          monthNamesShort string[12] - abbreviated names of the months (optional)
 *          monthNames    string[12] - names of the months (optional)
 * @return  string - the date in the above format
 */
function formatDate(format, date, settings = {}) {
  if (!date) {
    return '';
  }

  const {
    dayNamesShort = this.defaults.dayNamesShort,
    dayNames = this.defaults.dayNames,
    monthNamesShort = this.defaults.monthNamesShort,
    monthNames = this.defaults.monthNames,
  } = settings;

  let iFormat;

  // Check whether a format character is doubled
  const lookAhead = match => {
    const matches =
      iFormat + 1 < format.length && format.charAt(iFormat + 1) === match;
    if (matches) {
      iFormat++;
    }
    return matches;
  };

  // Format a number, with leading zero if necessary
  const formatNumber = (match, value, len) => {
    let num = '' + value;
    if (lookAhead(match)) {
      while (num.length < len) {
        num = '0' + num;
      }
    }

    return num;
  };

  // Format a name, short or long as requested
  const formatName = (match, value, shortNames, longNames) => {
    return lookAhead(match) ? longNames[value] : shortNames[value];
  };

  if (!date) {
    return '';
  }

  let output = '';
  let literal = false;

  for (iFormat = 0; iFormat < format.length; iFormat++) {
    if (literal) {
      if (format.charAt(iFormat) === "'" && lookAhead("'")) {
        literal = false;
      } else {
        output += format.charAt(iFormat);
      }
    } else {
      switch (format.charAt(iFormat)) {
        case 'd':
          output += formatNumber('d', date.getDate(), 2);
          break;

        case 'D':
          output += formatNumber('D', date.getDay(), dayNamesShort, dayNames);
          break;

        case 'o': {
          const date1 = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
          );
          const date2 = new Date(date.getFullYear(), 0, 0);
          const rounded = Math.round(
            (date1.getTime() - date2.getTime()) / 86400000,
          );
          output += formatNumber('o', rounded, 3);
          break;
        }

        case 'm':
          output += formatNumber('m', date.getMonth() + 1, 2);
          break;

        case 'M':
          output += formatName(
            'M',
            date.getMonth(),
            monthNamesShort,
            monthNames,
          );
          break;

        case 'y':
          output += lookAhead('y')
            ? date.getFullYear()
            : (date.getFullYear() % 100 < 10 ? '0' : '') +
              (date.getFullYear() % 100);
          break;

        case '@':
          output += date.getTime();
          break;

        case '!':
          output += date.getTime() * 10000 + this.ticksTo1970;
          break;

        case "'":
          if (lookAhead("'")) {
            output += "'";
          } else {
            literal = true;
          }
          break;

        default:
          output += format.charAt(iFormat);
      }
    }
  }

  return output;
}

const ticksTo1970 =
  ((1970 - 1) * 365 +
    Math.floor(1970 / 4) -
    Math.floor(1970 / 100) +
    Math.floor(1970 / 400)) *
  24 *
  60 *
  60 *
  10000000;

function getFormatConfig(inst) {
  let shortYearCutoff = this.get(inst, 'shortYearCutoff');
  shortYearCutoff =
    typeof shortYearCutoff !== 'string'
      ? shortYearCutoff
      : (new Date().getFullYear() % 100) + parseInt(shortYearCutoff, 10);

  return {
    shortYearCutoff,
    dayNamesShort: this.get(inst, 'dayNamesShort'),
    dayNames: this.get(inst, 'dayNames'),
    monthNamesShort: this.get(inst, 'monthNamesShort'),
    monthNames: this.get(inst, 'monthNames'),
  };
}

function disableDatepicker(target) {
  const inst = target.datepicker;

  if (!target.classList.contains(this.markerClassName)) {
    return;
  }

  const nodeName = target.nodeName.toLowerCase();
  if (nodeName === 'input') {
    target.disabled = true;
    Array.from(inst.trigger, el => {
      if (el.matches('button')) {
        el.disabled = true;
      } else if (el.matches('img')) {
        el.style.opacity = '0.5';
        el.style.cursor = 'default';
      }

      return el;
    });
  } else if (nodeName === 'div' || nodeName === 'span') {
    const children = Array.from(target.children).filter(el =>
      el.classList.contains(this.inlineClass),
    );
    children.forEach(child => {
      Array.from(child.children, el => {
        el.classList.add('ui-state-disabled');
        return el;
      });
      Array.from(
        child.querySelectorAll(
          'select.ui-datepicker-month, select.ui-datepicker-year',
        ),
        el => {
          el.disabled = 'true';
          return el;
        },
      );
    });
  }

  /**
   * @todo: Review (replaced $.map with Array.filter)
   */
  // delete entry
  this.disabledInputs = this.disabledInputs.filter(value => {
    return value === target ? null : value;
  });

  this.disabledInputs[this.disabledInputs.length] = target;
}

/* Attach an inline date picker to a div. */
function inlineDatepicker(target, inst) {
  if (target.classList.contains(this.markerClassName)) {
    return;
  }

  target.classList.add(this.markerClassName);
  target.appendChild(inst.dpDiv);
  target.datepicker = inst;
  this.setDate(inst, this.getDefaultDate(inst), true);
  this.updateDatepicker(inst);
  this.updateAlternate(inst);

  //If disabled option is true, disable the datepicker before showing it (see ticket #5665)
  if (inst.settings.disabled) {
    this.disableDatepicker(target);
  }

  // Set display:block in place of inst.dpDiv.show() which won't work on disconnected elements
  // http://bugs.jqueryui.com/ticket/7552 - A Datepicker created on a detached div has zero height
  inst.dpDiv.style.display = 'block';
}

function setDate(inst, date, noChange) {
  const clear = !date;
  const origMonth = inst.selectedMonth;
  const origYear = inst.selectedYear;
  const newDate = this.restrictMinMax(
    inst,
    this.determineDate(inst, date, new Date()),
  );

  inst.selectedDay = inst.currentDay = newDate.getDate();
  inst.drawMonth = inst.selectedMonth = inst.currentMonth = newDate.getMonth();
  inst.drawYear = inst.selectedYear = inst.currentYear = newDate.getFullYear();

  if (
    (origMonth !== inst.selectedMonth || origYear !== inst.selectedYear) &&
    !noChange
  ) {
    this.notifyChange(inst);
  }

  this.adjustInstDate(inst);
  if (inst.input) {
    inst.input.value = clear ? '' : this.formatDate(inst);
  }
}

/* A date may be specified as an exact value or a relative one. */
function determineDate(inst, date, defaultDate) {
  const offsetNumeric = offset => {
    const _date = new Date();
    _date.setDate(_date.getDate() + offset);
    return _date;
  };

  const offsetString = offset => {
    try {
      return DatePicker.parseDate(
        DatePicker.get(inst, 'dateFormat'),
        offset,
        DatePicker.getFormatConfig(inst),
      );
    } catch (e) {
      // Ignore
    }

    const _date =
      (offset.toLowerCase().match(/^c/) ? DatePicker.getDate(inst) : null) ||
      new Date();
    let year = _date.getFullYear();
    let month = _date.getMonth();
    let day = _date.getDate();
    const pattern = /([+-]?[0-9]+)\s*(d|D|w|W|m|M|y|Y)?/g;
    let matches = pattern.exec(offset);

    while (matches) {
      switch (matches[2] || 'd') {
        case 'd':
        case 'D':
          day += parseInt(matches[1], 10);
          break;

        case 'w':
        case 'W':
          day += parseInt(matches[1], 10) * 7;
          break;

        case 'm':
        case 'M':
          month += parseInt(matches[1], 10);
          day = Math.min(day, DatePicker.getDaysInMonth(year, month));
          break;

        case 'y':
        case 'Y':
          year += parseInt(matches[1], 10);
          day = Math.min(day, DatePicker.getDaysInMonth(year, month));
          break;
      }
      matches = pattern.exec(offset);
    }

    return new Date(year, month, day);
  };

  let newDate =
    date == null || date === ''
      ? defaultDate
      : typeof date === 'string'
      ? offsetString(date)
      : typeof date === 'number'
      ? isNaN(date)
        ? defaultDate
        : offsetNumeric(date)
      : new Date(date.getTime());

  newDate =
    newDate && newDate.toString() === 'Invalid Date' ? defaultDate : newDate;

  if (newDate) {
    newDate.setHours(0);
    newDate.setMinutes(0);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
  }

  return this.daylightSavingAdjust(newDate);
}

/* Ensure a date is within any min/max bounds. */
function restrictMinMax(inst, date) {
  const minDate = this.getMinMaxDate(inst, 'min');
  const maxDate = this.getMinMaxDate(inst, 'max');
  const newDate = minDate && date < minDate ? minDate : date;

  return maxDate && newDate > maxDate ? maxDate : newDate;
}

/* Determine the current maximum date - ensure no time components are set. */
function getMinMaxDate(inst, minMax) {
  return this.determineDate(inst, this.get(inst, minMax + 'Date'), null);
}

/* Notify change of month/year. */
function notifyChange(inst) {
  const onChange = this.get(inst, 'onChangeMonthYear');
  if (onChange) {
    onChange.apply(inst.input ? inst.input : null, [
      inst.selectedYear,
      inst.selectedMonth + 1,
      inst,
    ]);
  }
}

/* Adjust one of the date sub-fields. */
function adjustInstDate(inst, offset, period) {
  const year = inst.selectedYear + (period === 'Y' ? offset : 0);
  const month = inst.selectedMonth + (period === 'M' ? offset : 0);
  const day =
    Math.min(inst.selectedDay, this.getDaysInMonth(year, month)) +
    (period === 'D' ? offset : 0);
  const date = this.restrictMinMax(
    inst,
    this.daylightSavingAdjust(new Date(year, month, day)),
  );

  inst.selectedDay = date.getDate();
  inst.drawMonth = inst.selectedMonth = date.getMonth();
  inst.drawYear = inst.selectedYear = date.getFullYear();

  if (period === 'M' || period === 'Y') {
    this.notifyChange(inst);
  }
}

/* Find the number of days in a given month. */
function getDaysInMonth(year, month) {
  return 32 - this.daylightSavingAdjust(new Date(year, month, 32)).getDate();
}

function getDefaultDate(inst) {
  return this.restrictMinMax(
    inst,
    this.determineDate(inst, this.get(inst, 'defaultDate'), new Date()),
  );
}

/* Generate the date picker content. */
function updateDatepicker(inst) {
  //Reset the max number of rows being displayed (see #7043)
  this.maxRows = 4;
  // For delegate hover events
  datepicker_instActive = inst;
  inst.dpDiv.innerHTML = '';
  inst.dpDiv.appendChild(this.generateHTML(inst));
  this.attachHandlers(inst);

  const numMonths = this.getNumberOfMonths(inst);
  const cols = numMonths[1];
  const width = 17;
  const activeCell = inst.dpDiv.querySelector(`.${this.dayOverClass} a`);

  if (activeCell) {
    /**
     * @todo: REVIEW
     */
    datepicker_handleMouseOver.apply(activeCell);
  }

  inst.dpDiv.style.width = '';
  [
    'ui-datepicker-multi-2',
    'ui-datepicker-multi-3',
    'ui-datepicker-multi-4',
  ].forEach(className => inst.dpDiv.classList.remove(className));

  if (cols > 1) {
    inst.dpDiv.classList.add(`ui-datepicker-multi-${cols}`);
    inst.dpDiv.style.width = `${width * cols}em`;
  }

  const addRemoveMulti =
    numMonths[0] !== 1 || numMonths[1] !== 1 ? 'add' : 'remove';
  inst.dpDiv.classList[addRemoveMulti]('ui-datepicker-multi');
  const addRemoveRTL = this.get(inst, 'isRTL') ? 'add' : 'remove';
  inst.dpDiv.classList[addRemoveRTL]('ui-datepicker-rtl');

  if (
    inst === DatePicker.curInst &&
    DatePicker.datepickerShowing &&
    DatePicker.shouldFocusInput(inst)
  ) {
    /**
     * @todo: Review
     */
    inst.input.focus();
  }

  // Deffered render of the years select (to avoid flashes on Firefox)
  if (inst.yearshtml) {
    let origYearsHTML = inst.yearshtml;
    setTimeout(() => {
      //assure that inst.yearshtml didn't change.
      if (inst.yearshtml && origYearsHTML === inst.yearshtml) {
        inst.dpDiv
          .querySelector('select.ui-datepicker-year')
          .replaceWith(inst.yearshtml);
      }
      origYearsHTML = inst.yearshtml = null;
    }, 0);
  }
}

function generateHTML(inst) {
  const tempDate = new Date();
  const today = this.daylightSavingAdjust(
    // Clear time from date
    new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()),
  );
  const isRTL = this.get(inst, 'isRTL');
  const showButtonPanel = this.get(inst, 'showButtonPanel');
  const hideIfNoPrevNext = this.get(inst, 'hideIfNoPrevNext');
  const navigationAsDateFormat = this.get(inst, 'navigationAsDateFormat');
  const numMonths = this.getNumberOfMonths(inst);
  const showCurrentAtPos = this.get(inst, 'showCurrentAtPos');
  const stepMonths = this.get(inst, 'stepMonths');
  const isMultiMonth = numMonths[0] !== 1 || numMonths[1] !== 1;
  const currentDate = this.daylightSavingAdjust(
    !inst.currentDay
      ? new Date(9999, 9, 9)
      : new Date(inst.currentYear, inst.currentMonth, inst.currentDay),
  );
  const minDate = this.getMinMaxDate(inst, 'min');
  const maxDate = this.getMinMaxDate(inst, 'max');
  let drawMonth = inst.drawMonth - showCurrentAtPos;
  let drawYear = inst.drawYear;

  if (drawMonth < 0) {
    drawMonth += 12;
    drawYear--;
  }

  if (maxDate) {
    let maxDraw = this.daylightSavingAdjust(
      new Date(
        maxDate.getFullYear(),
        maxDate.getMonth() - numMonths[0] * numMonths[1] + 1,
        maxDate.getDate(),
      ),
    );
    maxDraw = minDate && maxDraw < minDate ? minDate : maxDraw;

    while (
      this.daylightSavingAdjust(new Date(drawYear, drawMonth, 1)) > maxDraw
    ) {
      drawMonth--;
      if (drawMonth < 0) {
        drawMonth = 11;
        drawYear--;
      }
    }
  }
  inst.drawMonth = drawMonth;
  inst.drawYear = drawYear;

  let prevText = this.get(inst, 'prevText');
  prevText = !navigationAsDateFormat
    ? prevText
    : this.formatDate(
        prevText,
        this.daylightSavingAdjust(
          new Date(drawYear, drawMonth - stepMonths, 1),
        ),
        this.getFormatConfig(inst),
      );

  const prev = this._canAdjustMonth(inst, -1, drawYear, drawMonth)
    ? "<a class='ui-datepicker-prev ui-corner-all' data-handler='prev' data-event='click'" +
      " title='" +
      prevText +
      "'><span class='ui-icon ui-icon-circle-triangle-" +
      (isRTL ? 'e' : 'w') +
      "'>" +
      prevText +
      '</span></a>'
    : hideIfNoPrevNext
    ? ''
    : "<a class='ui-datepicker-prev ui-corner-all ui-state-disabled' title='" +
      prevText +
      "'><span class='ui-icon ui-icon-circle-triangle-" +
      (isRTL ? 'e' : 'w') +
      "'>" +
      prevText +
      '</span></a>';

  let nextText = this.get(inst, 'nextText');
  nextText = !navigationAsDateFormat
    ? nextText
    : this.formatDate(
        nextText,
        this.daylightSavingAdjust(
          new Date(drawYear, drawMonth + stepMonths, 1),
        ),
        this.getFormatConfig(inst),
      );
  const next = this._canAdjustMonth(inst, +1, drawYear, drawMonth)
    ? "<a class='ui-datepicker-next ui-corner-all' data-handler='next' data-event='click'" +
      " title='" +
      nextText +
      "'><span class='ui-icon ui-icon-circle-triangle-" +
      (isRTL ? 'w' : 'e') +
      "'>" +
      nextText +
      '</span></a>'
    : hideIfNoPrevNext
    ? ''
    : "<a class='ui-datepicker-next ui-corner-all ui-state-disabled' title='" +
      nextText +
      "'><span class='ui-icon ui-icon-circle-triangle-" +
      (isRTL ? 'w' : 'e') +
      "'>" +
      nextText +
      '</span></a>';

  let currentText = this.get(inst, 'currentText');
  const gotoDate =
    this.get(inst, 'gotoCurrent') && inst.currentDay ? currentDate : today;
  currentText = !navigationAsDateFormat
    ? currentText
    : this.formatDate(currentText, gotoDate, this.getFormatConfig(inst));

  const controls = !inst.inline
    ? "<button type='button' class='ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all' data-handler='hide' data-event='click'>" +
      this._get(inst, 'closeText') +
      '</button>'
    : '';

  const buttonPanel = showButtonPanel
    ? "<div class='ui-datepicker-buttonpane ui-widget-content'>" +
      (isRTL ? controls : '') +
      (this._isInRange(inst, gotoDate)
        ? "<button type='button' class='ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all' data-handler='today' data-event='click'" +
          '>' +
          currentText +
          '</button>'
        : '') +
      (isRTL ? '' : controls) +
      '</div>'
    : '';

  let firstDay = parseInt(this.get(inst, 'firstDay'), 10);
  firstDay = isNaN(firstDay) ? 0 : firstDay;

  const showWeek = this._get(inst, 'showWeek');
  const dayNames = this._get(inst, 'dayNames');
  const dayNamesMin = this._get(inst, 'dayNamesMin');
  const monthNames = this._get(inst, 'monthNames');
  const monthNamesShort = this._get(inst, 'monthNamesShort');
  const beforeShowDay = this._get(inst, 'beforeShowDay');
  const showOtherMonths = this._get(inst, 'showOtherMonths');
  const selectOtherMonths = this._get(inst, 'selectOtherMonths');
  const defaultDate = this.getDefaultDate(inst);
  let html = '';

  for (let row = 0; row < numMonths[0]; row++) {
    let group = '';
    this.maxRows = 4;
    for (let col = 0; col < numMonths[1]; col++) {
      const selectedDate = this.daylightSavingAdjust(
        new Date(drawYear, drawMonth, inst.selectedDay),
      );
      const cornerClass = 'ui-corner-all';
      let calender = '';

      if (isMultiMonth) {
        calender += '<div class="ui-datepicker-group';

        if ()
      }
    }
  }
}

// PRIVATE FUNCTIONS (I guess...)

/*
 * Bind hover events for datepicker elements.
 * Done via delegate so the binding only occurs once in the lifetime of the parent div.
 * Global datepicker_instActive, set by _updateDatepicker allows the handlers to find their way back to the active picker.
 */
function datepicker_bindHover(dpDiv) {
  const selector =
    'button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a';
  dpDiv.addEventListener('mouseout', evt => {
    if (evt.currentTarget.matches(selector)) {
      console.log(
        '%c Howdy there champ, we may have found something!',
        'color: blue',
      );
    }
    if (!evt.target.matches(selector)) {
      return;
    }
    const { target } = evt;
    target.classList.remove('ui-state-hover');
    if (target.className.includes('ui-datepicker-prev')) {
      target.classList.remove('ui-datepicker-prev-hover');
    }
    if (target.className.includes('ui-datepicker-next')) {
      target.classList.remove('ui-datepicker-next-hover');
    }
  });

  dpDiv.addEventListener('mouseover', datepicker_handleMouseOver);
}

function datepicker_handleMouseOver(evt) {
  const selector =
    'button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a';
  if (!evt.target.matches(selector)) {
    return;
  }

  const { target } = evt;
  if (
    DatePicker.isDisabledDatepicker(
      datepicker_instActive.inline
        ? datepicker_instActive.dpDiv.parentElement
        : datepicker_instActive.input,
    )
  ) {
    /**
     * @todo: REVIEW
     */
    target
      .closest('ui-datepicker-calendar')
      .querySelector('a')
      .classList.remove('ui-state-hover');
    target.classList.add('ui-state-hover');
    if (target.className.includes('ui-datepicker-prev')) {
      target.classList.add('ui-datepicker-prev-hover');
    }
    if (target.className.includes('ui-datepicker-next')) {
      target.classList.add('ui-datepicker-next-hover');
    }
  }
}

// TBD

// TODO rename to "widget" when switching to widget factory
function widgetDatePicker() {
  return this.dpDiv;
}

/* Override the default settings for all instances of the date picker.
 * @param  settings  object - the new settings to use as defaults (anonymous object)
 * @return the manager object
 */
function setDefaults(settings) {
  datepicker_extendRemove(this.defaults, settings || {});
  return this;
}

// ===================================================================
//
//  Map function to prototype (private functions can be left out)
//
// ====================================================================
const proto = DatePicker.prototype;

// Class name added to elements to indicate already configured with a date picker.
proto.markerClassName = 'hasDatePicker';
// Keep track of the maximum number of rows displayed (see #7043)
proto.maxRows = 4;

proto.attachDatepicker = attachDatepicker;
proto.newInst = newInst;
proto.connectDatepicker = connectDatepicker;
proto.attachments = attachments;
proto.get = get;
proto.autoSize = autoSize;
proto._formatDate = _formatDate;
proto.daylightSavingAdjust = daylightSavingAdjust;
proto.formatDate = formatDate;
proto.ticksTo1970 = ticksTo1970;
proto.getFormatConfig = getFormatConfig;
proto.disableDatepicker = disableDatepicker;
proto.inlineDatepicker = inlineDatepicker;
proto.setDate = setDate;
proto.determineDate = determineDate;
proto.restrictMinMax = restrictMinMax;
proto.getMinMaxDate = getMinMaxDate;
proto.notifyChange = notifyChange;
proto.adjustInstDate = adjustInstDate;
proto.getDaysInMonth = getDaysInMonth;
proto.getDefaultDate = getDefaultDate;
proto.updateDatepicker = updateDatepicker;
proto.generateHTML = generateHTML;

// TBD
proto.widgetDatePicker = widgetDatePicker;
proto.setDefaults = setDefaults;

// ===================================================================
//
//  END DATE PICKER UI
//
// ====================================================================

/* eslint-disable */

// ===================================================================
// Source code adapted (vanilla) from:
// https://dequeuniversity.com/library/aria/date-pickers/sf-date-picker
// Dependencies: jQuery, jQuery UI
// ====================================================================

/*
$(function () {
  $('#datepicker').datepicker({
    showOn: 'button',
    buttonImage: 'https://dequeuniversity.com/assets/images/calendar.png', // File (and file path) for the calendar image
    buttonImageOnly: false,
    buttonText: 'Calendar View',
    dayNamesShort: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    showButtonPanel: true,
    closeText: 'Close',
    onClose: removeAria
  });

  // Add aria-describedby to the button referring to the label
  $('.ui-datepicker-trigger').attr('aria-describedby', 'datepickerLabel');

  dayTripper();
});
*/

function dayTripper() {
  const trigger = document.querySelector('.ui-datepicker-trigger');
  if (trigger) {
    trigger.addEventListener('click', onTriggerClick);
  }
}

function onTriggerClick() {
  setTimeout(() => {
    let today = document.querySelector('.ui-datepicker-today a');

    if (!today) {
      today =
        document.querySelector('.ui-state-active') ||
        document.querySelector('.ui-state-default');
    }

    // Hide the entire page (except the date picker)
    // from screen readers to prevent documnet navigation
    // (by headings, etc.) while the popup is open
    const main = document.querySelector('main');
    if (main) main.setAttribute('id', 'dp-container');
    const dpContainer = document.querySelector('#dp-container');
    if (dpContainer) dpContainer.setAttribute('aria-hidden', 'true');
    const skipNav = document.querySelector('#skipnav');
    if (skipNav) skipNav.setAttribute('aria-hidden', 'true');

    // Hide the "today" button because it doesn't do what
    // you think it supposed to do
    const todayBtn = document.querySelector('.ui-datepicker-current');
    if (todayBtn) todayBtn.style.display = 'none';

    today.focus();
    datePickHandler();
    document.addEventListener('click', closeCalendar);
    // #ui-datepicker-div .ui-datepicker-close
  }, 0);
}

function datePickHandler() {
  let activeDate;
  const container = document.getElementById('ui-datepicker-div');
  const input = document.getElementById('datepicker');

  if (!container || !input) {
    return;
  }

  container.setAttribute('role', 'application');
  container.setAttribute('aria-label', 'Calendar view date-picker');

  // The top controls:
  const prev = container.querySelector('.ui-datepicker-prev');
  const next = container.querySelector('.ui-datepicker-next');

  // This is the line that needs to be fixed for use on pages with base URL set in head
  next.href = 'javascript:void(0)';
  prev.href = 'javascript:void(0)';

  next.setAttribute('role', 'button');
  next.removeAttribute('title');
  prev.setAttribute('role', 'button');
  prev.removeAttribute('title');

  appendOffscreenMonthText(next);
  appendOffscreenMonthText(prev);

  // Delegation won't work here for whatever reason, se we are
  // forced to attach individual click listeners to the prev /
  // next month buttons each time they are added to the DOM

  next.addEventListener('click', handleNextClicks);
  prev.addEventListener('click', handlePrevClicks);

  monthDayYearText();

  container.addEventListener('keydown', calendarKeyboardListener);
}

function calendarKeyboardListener(evt) {
  const { which, target } = evt.which;
  let dateCurrent = getCurrentDate(container);

  if (!dateCurrent) {
    dateCurrent = document.querySelector('a.ui-state-default');
    setHighlightState(dateCurrent, container);
  }

  // ESC
  if (which === 27) {
    evt.stopPropagation();
    return closeCalendar();

    // SHIFT + TAB
  } else if (which === 9 && evt.shiftKey) {
    evt.preventDefault();

    // Close button
    if (target.classList.contains('ui-datepicker-close')) {
      document.querySelector('.ui-datepicker-prev').focus();

      // Date link
    } else if (target.classList.contains('ui-state-default')) {
      document.querySelector('.ui-datepicker-close').focus();

      // The prev link
    } else if (target.classList.contains('ui-datepicker-prev')) {
      document.querySelector('.ui-datepicker-next').focus();

      // The next link
    } else if (target.classList.contains('ui-datepicker-next')) {
      activeDate =
        document.querySelector('.ui-state-highlight') ||
        document.querySelector('.ui-state-active');

      if (activeDate) {
        activeDate.focus();
      }
    }

    // TAB
  } else if (which === 9) {
    evt.preventDefault();

    // Close button
    if (target.classList.contains('ui-datepicker-close')) {
      activeDate =
        document.querySelector('.ui-state-highlight') ||
        document.querySelector('.ui-state-active');

      if (activeDate) {
        activeDate.focus();
      }
    } else if (target.classList.contains('ui-state-default')) {
      document.querySelector('.ui-datepicker-next').focus();
    } else if (target.classList.contains('ui-datepicker-next')) {
      document.querySelector('.ui-datepicker-prev').focus();
    } else if (target.classList.contains('ui-datepicker-prev')) {
      document.querySelector('.ui-datepicker-close').focus();
    }

    // LEFT arrow
  } else if (which === 37) {
    // If we're on a date link
    if (
      !target.classList.contains('ui-datepicker-close') &&
      target.classList.contains('ui-state-default')
    ) {
      evt.preventDefault();
      previousDay(target);
    }

    // RIGHT arrow
  } else if (which === 39) {
    // If we're on a date link
    if (
      !target.classList.contains('ui-datepicker-close') &&
      target.classList.contains('ui-state-default')
    ) {
      evt.preventDefault();
      nextDay(target);
    }

    // UP arrow
  } else if (which === 38) {
    if (
      !target.classList.contains('ui-datepicker-close') &&
      target.classList.contains('ui-state-default')
    ) {
      evt.preventDefault();
      upHandler(target, container, prev);
    }

    // DOWN arrow
  } else if (which === 40) {
    if (
      !target.classList.contains('ui-datepicker-close') &&
      target.classList.contains('ui-state-default')
    ) {
      evt.preventDefault();
      downHandler(target, container, next);
    }

    // ENTER
  } else if (which === 13) {
    if (target.classList.contains('ui-state-default')) {
      setTimeout(() => closeCalendar(), 100);
    } else if (target.classList.contains('ui-datepicker-prev')) {
      handlePrevClicks();
    } else if (target.classList.contains('ui-datepicker-next')) {
      handleNextClicks();
    }

    // ?
  } else if (which === 32) {
    if (
      target.classList.contains('ui-datepicker-prev') ||
      target.classList.contains('ui-datepicker-next')
    ) {
      target.click();
    }

    // PAGE UP
  } else if (which === 33) {
    moveOneMonth(target, 'prev');

    // PAGE DOWN
  } else if (which === 34) {
    moveOneMonth(target, 'next');

    // HOME
  } else if (which === 36) {
    const firstOfMonth = target
      .closest('tbody')
      .querySelector('.ui-state-default');

    if (firstOfMonth) {
      firstOfMonth.focus();
      setHighlightState(
        firstOfMonth,
        document.querySelector('#ui-datepicker-div'),
      );
    }

    // END
  } else if (which === 35) {
    const $daysOfMonth = target
      .closest('tbody')
      .querySelectorAll('.ui-state-default');
    const lastDay = $daysOfMonth($daysOfMonth.length - 1);

    if (lastDay) {
      lastDay.focus();
      setHighlightState(lastDay, document.querySelector('#ui-datepicker-div'));
    }
  }

  document.querySelector('.ui-datepicker-current').style.display === 'none';
}

function closeCalendar() {
  const container = document.querySelector('#ui-datepicker-div');
  container.removeEventListener('keydown', calendarKeyboardListener);
  const input = document.querySelector('#datepicker');
  /*
   * @todo: REFACTOR
   */
  // input.datepicker('hide')
}

function removeAria() {
  // make the rest of the page accessible again
  document.querySelector('#dp-container').removeAttribute('aria-hidden');
  document.querySelector('#skipnav').removeAttribute('aria-hidden');
}

/*
 * UTILS
 */
const isOdd = num => num % 2;

function moveOneMonth(currentDate, dir) {
  const button =
    dir === 'next'
      ? document.querySelector('.ui-datepicker-next')
      : document.querySelector('.ui-datepicker-prev');

  if (!button) {
    return;
  }

  const ENABLED_SELECTOR =
    '#ui-datepicker-div tbody td:not(.ui-state-disabled)';
  const currentCells = Array.from(document.querySelectorAll(ENABLED_SELECTOR));
  let currentIdx = currentCells.findIndex(el => el === currentDate.parentNode);

  button.click();

  setTimeout(() => {
    updateHeaderElements();

    const newCells = document.querySelectorAll(ENABLED_SELECTOR);
    let newTd = newCells[currentIdx];
    let newAnchor = newTd && newTd.querySelector('a');

    while (!newAnchor) {
      currentIdx--;
      newTd = newCells[currentIdx];
      newAnchor = newTd && newTd.querySelector('a');
    }

    setHighlightState(newAnchor, document.querySelector('#ui-datepicker-div'));
    newAnchor.focus();
  }, 0);
}

function handleNextClicks() {
  setTimeout(() => {
    updateHeaderElement();
    prepHighlightState();
    document.querySelector('.ui-datepicker-next').focus();
    document.querySelector('.ui-datepicker-current').style.display = 'none';
  }, 0);
}

function handlePrevClicks() {
  setTimeout(() => {
    updateHeaderElements();
    prepHighlightState();
    document.querySelector('.ui-datepicker-prev').focus();
    document.querySelector('.ui-datepicker-current').style.display = 'none';
  }, 0);
}

function previousDay(dateLink) {
  if (!dateLink) {
    return;
  }

  const td = dateLink.closest('td');
  if (!td) {
    return;
  }

  const container = document.getElementById('ui-datepicker-div');
  const prevTd = td.previousElementSibling;

  /*
   * @todo: REVIEW
   *  // prevDateLink = $('a.ui-state-default', prevTd)[0];
   */
  const prevDateLink = prevTd.querySelector('a.ui-state-default');

  if (prevTd && prevDateLink) {
    setHighlightState(prevDateLink, container);
    prevDateLink.focus();
  } else {
    handlePrevious(dateLink);
  }
}

function handlePrevious(target) {
  const container = document.getElementById('ui-datepicker-div');

  if (!target) {
    return;
  }

  const currentRow = target.closest('tr');

  if (!currentRow) {
    return;
  }

  const previousRow = currentRow.previousElementSibling;
  if (!previousRow) {
    // There is not a previous row, so we go to previous month
    previousMonth();
  } else {
    /*
     * @todo: REVIEW
     *  // var prevRowDates = $('td a.ui-state-default', previousRow);
     */
    const prevRowDates = previousRow.querySelectorAll('td a.ui-state-default');
    const prevRowDate = prevRowDates[prevRowDates.length - 1];

    if (prevRowDate) {
      setTimeout(() => {
        setHighlightState(prevRowDate, container);
        prevRowDate.focus();
      }, 0);
    }
  }
}

function previousMonth() {
  const prevLink = document.querySelector('.ui-datepicker-prev');
  const container = document.getElementById('ui-datepicker-div');
  prevLink.click();

  // Focus last day of new month
  setTimeout(() => {
    const trs = container.querySelectorAll('tr');
    const lastRowTdLinks = trs[trs.length - 1].querySelectorAll(
      'td a.ui-state-default',
    );
    const lastDate = lastRowTdLinks[lastRowTdLinks.length - 1];

    // Update the cached header elements
    updateHeaderElements();

    setHighlightState(lastDate, container);
    lastDate.focus();
  }, 0);
}

/*
 * =====================
 *  NEXT
 * =====================
 */

/*
 * Handles right arrow key navigation
 * @param [HTMLElement] dateLink the target of the keyboard event
 */
function nextDay(dateLink) {
  const container = document.getElementById('ui-datepicker-div');
  if (!dateLink) {
    return;
  }

  const td = dateLink.closest('td');
  if (!td) {
    return;
  }

  const nextTd = td.nextElementSibling;
  const nextDateLink = nextTd.querySelector('a.ui-state-default');

  if (nextTd && nextDateLink) {
    setHightlightState(nextDateLink, container);
    // The next day (same row)
    nextDateLink.focus();
  } else {
    handleNext(dateLink);
  }
}

function handleNext(target) {
  const container = document.getElementById('ui-datepicker-div');
  if (!target) {
    return;
  }

  const currentRow = target.closest('tr');
  const nextRow = currentRow.nextElementSibling;

  if (!nextRow) {
    nextMonth();
  } else {
    const nextRowFirstDate = nextRow.querySelector('a.ui-state-default');
    if (nextRowFirstDate) {
      setHighlightState(nextRowFirstDate, container);
      nextRowFirstDate.focus();
    }
  }
}

function nextMonth() {
  nextMon = document.querySelector('.ui-datepicker-next');
  const container = documnt.getElementById('ui-datepicker-div');
  nextMon.click();

  // Focus the first day of the new month
  setTimeout(() => {
    // Update the cached header elements
    updateHeaderElements();

    const firstDate = container.querySelector('a.ui-state-default');
    setHighlightState(firstDate, container);
    firstDate.focus();
  }, 0);
}

/*
 * =====================
 *  UP
 * =====================
 */

/*
 * Handle the up arrow navigation through dates
 * @param (HTMLElement) target The target of the keyboard event (day)
 * @param (HTMLElement) cont The calendar container
 * @param (HTMLElement) prevLink Link to navigate to previous month
 */
function upHandler(target, cont, prevLink) {
  prevLink = document.querySelector('.ui-datepicker-prev');
  const rowContext = target.closest('tr');
  if (!rowContext) {
    return;
  }

  const rowTds = Array.from(rowContext.querySelectorAll('td'));
  const rowLinks = Array.from(
    rowContext.querySelectorAll('a.ui-state-default'),
  );
  const targetIndex = rowLinks.findIndex(el => el === target);
  const prevRow = rowContext.previousElementSibling;
  const prevRowTds = prevRow.querySelectorAll('td');
  const parallel = prevRowTds[targetIndex];
  const linkCheck = parallel.querySelector('a.ui-state-default');

  if (prevRow && parallel && linkCheck) {
    // There is a previous row, a td at the same index
    // of the target AND there is a link in that td
    setHighlightState(linkCheck, cont);
    linkCheck.focus();
  } else {
    // We're either on the first row of a month, or we're on the
    // second and there is not a date link directly above the target
    prevLink.click();
    setTimeout(() => {
      // Update the cached header elements
      updateHeaderElements();

      const newRows = cont.querySelectorAll('tr');
      const lastRow = newRows[newRows.length - 1];
      const lastRowTds = lastRow.querySelectorAll('td');
      const tdParallelIndex = rowTds.findIndex(el => el === target.parentNode);
      const newParallel = lastRowTds[tdParallelIndex];
      const newCheck = newParallel.querySelector('a.ui-state-default');

      if (lastRow && newParallel && newCheck) {
        setHighlightState(newCheck, cont);
        newCheck.focus();
      } else {
        // There's no date link on the last week (row) of the new month
        // meaning its an empty cell, so we'll try the 2nd to last week
        const secondLastRow = newRows[newRows.length - 2];
        const secondTds = secondLastRow.querySelectorAll('td');
        const targetTd = secondTds[tdParallelIndex];
        const linkCheck = targetTd.querySelector('a.ui-state-default');

        if (linkCheck) {
          setHighlightState(linkCheck, cont);
          linkCheck.focus();
        }
      }
    }, 0);
  }
}

/*
 * =====================
 *  DOWN
 * =====================
 */

/*
 * Handles down arrow navigation through dates in calendar
 * @param (HTMLElement) target The target of the keyboard event (day)
 * @param (HTLElement) cont The calendar container
 * @param (HTMLElement) nextLink Link to navigate to the next month
 */
function downHandler(target, cont, nextLink) {
  nextLink = document.querySelector('.ui-datepicker-next');
  const targetRow = target.closest('tr');
  if (!targetRow) {
    return;
  }

  const targetCells = Array.from(targetRow.querySelectorAll('td'));
  // The td (parent of target) index
  const cellIndex = targetCells.findIndex(el => el === target.parentNode);
  const nextRow = targetRow.nextElementSibling;
  const nextRowCells = nextRow.querySelectorAll('td');
  const nextWeekTd = nextRowCells[cellIndex];
  const nextWeekCheck = nextWeekTd.querySelector('a.ui-state-default');

  if (nextRow && nextWeekTd && nextWeekCheck) {
    // Theres a next row, a TD at the same index of 'target',
    // and theres an anchor within that td
    setHighlightState(nextWeekCheck, cont);
    nextWeekCheck.focus();
  } else {
    nextLink.click();

    setTimeout(() => {
      // Update the cached header elements
      updateHeaderElements();

      const nextMonthTrs = cont.querySelectorAll('tbody tr');
      const firstTds = nextMonthTrs.querySelectorAll('td');
      const firstParallel = firstTds[cellIndex];
      const firstCheck = firstParallel.querySelector('a.ui-state-default');

      if (firstParallel && firstCheck) {
        setHighlightState(firstCheck, cont);
        firstCheck.focus();
      } else {
        // lets try the second row because we didn't find a
        // date link inthe first row at the target's index
        const secondRow = nextMonthTrs[1];
        const secondTds = secondRow.querySelectorAll('td');
        const secondRowTd = secondTds[cellIndex];
        const secondCheck = secondRowTd.querySelector('a.ui-state-default');

        if (secondRow && secondCheck) {
          setHighlightState(secondCheck, cont);
          secondCheck.focus();
        }
      }
    }, 0);
  }
}

function onCalendarHide() {
  closeCalendar();
}

// Add an aria-label to the date link indicating the currently focused date
// (formated identically to the required format: mm/dd/yyyy)
function monthDayYearText() {
  /*
   * @todo: See if it works, or use forEach
   */
  const cleanUps = Array.from(document.querySelectorAll('.amaze-date'), clean =>
    clean.parentNode.removeChild(clean),
  );

  const datePickDiv = document.getElementById('ui-datepicker-div');

  if (!datePickDiv) {
    return;
  }

  const dates = Array.from(
    datePickDiv.querySelectorAll('a.ui-state-default'),
    (date, index) => {
      date.setAttribute('role', 'button');
      date.addEventListener('keydown', e => {
        if (e.which === 32) {
          e.preventDefault();
          e.target.click();
          /*
           * @todo: Check if throws illegal invocation
           */
          setTimeout(closeCalendar, 100);
        }
      });

      const currentRow = date.closest('tr');
      const currentTds = Array.from(currentRow.querySelectorAll('td'));
      const currentIndex = currentTds.findIndex(el => el === date.parentNode);
      const headThs = datePickDiv.querySelectorAll('thead tr th');
      const dayIndex = headThs[currentIndex];
      const daySpan = dayIndex.querySelector('span');
      const monthName = datePickDiv.querySelector('.ui-datepicker-month')
        .innerHTML;
      const year = datePickDiv.querySelector('.ui-datepicker-year').innerHTML;
      const number = date.innerHTML;

      if (!daySpan || !monthName || !number || !year) {
        return;
      }

      // AT Reads: { month } { date } { year } { day }
      // "December 18 2014 Thursday"
      const dateText =
        date.innerHTML + ' ' + monthName + ' ' + year + ' ' + daySpan.title;

      // AT Reads: { date(number) } { name of day } { name of month } { year(number) }
      // const dateText = date.innerHTML + ' ' + daySpan.title + ' ' + monthName + ' ' + year;

      // Add an aria-label to the date link reading out the currently focused date
      date.setAttribute('aria-label', dateText);
    },
  );
}

// Update the cached header elements because we're in a new month or year
function updateHeaderElements() {
  const context = document.getElementById('ui-datepicker-div');
  if (!context) {
    return;
  }

  const prev = context.querySelector('.ui-datepicker-prev');
  const next = context.querySelector('.ui-datepicker-next');

  next.href = 'javascript:void(0)';
  prev.href = 'javascript:void(0)';

  next.setAttribute('role', 'button');
  prev.setAttribute('role', 'button');
  appendOffscreenMonthText(next);
  appendOffscreenMonthText(prev);

  next.addEventListener('click', handleNextClicks);
  prev.addEventListener('click', handlePrevClicks);

  // Add month day year text
  monthDayYearText();
}

function prepHighlightState() {
  const cage = document.getElementById('ui-datepicker-div');
  const highlight =
    cage.querySelector('.ui-state-highlight') ||
    cage.querySelector('.ui-state-default');

  if (highlight && cage) {
    setHighlightState(highlight, cage);
  }
}

// Set the highlighted class to date elements, when focus is received
function setHighlightState(newHighlight, container) {
  const prevHighlight = getCurrentDate(container);

  // Remove the highlight state from previously
  // highlighted date and add it ot our newly active date
  prevHighlight.classList.remove('ui-state-highlight');
  newHighlight.classList.add('ui-state-highlight');
}

// Grabs the current date based on the highlight class
function getCurrentDate(container) {
  return container.querySelector('.ui-state-highlight');
}

// Appends logical next/prev month text to the buttons
// -ex: Next, Month, January 2015
//      Previous Month, November 2014
function appendOffscreenMonthText(button) {
  const isNext = button.classList.contains('ui-datepicker-next');
  const months = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];

  const currentMonth = document
    .querySelector('.ui-datepicker-title .ui-datepicker-month')
    .textContent.toLowerCase();
  const monthIndex = months.findIndex(month => month === currentMonth);
  let currentYear = document
    .querySelector('.ui-datepicker-title .ui-datepicker-year')
    .textContent.toLowerCase();
  let adjacentIndex = isNext ? monthIndex + 1 : monthIndex - 1;

  if (isNext && currentMonth === 'december') {
    currentYear = parseInt(currentYear, 10) + 1;
    adjacentIndex = 0;
  } else if (!isNext && currentMonth === 'january') {
    currentYear = parseInt(currentYear, 10) - 1;
    adjacentIndex = months.length - 1;
  }

  const buttonText = isNext
    ? 'Next Month, ' + firstToCap(months[adjacentIndex]) + ' ' + currentYear
    : 'Previous Month, ' +
      firstToCap(months[adjacentIndex]) +
      ' ' +
      currentYear;

  button.querySelector('.ui-icon').innerHTML = buttonText;
}

// Capitalize first letter
function firstToCap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
