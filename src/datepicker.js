import './datepicker.css';

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
  this.disabledInputs = [];
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
  inst.append = null;
  inst.trigger = null;
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

  input.removeEventListener('focus', this.showDatepicker);

  if (inst.trigger) {
    /**
     * @todo: REVIEW
     */
    inst.trigger.remove();
  }

  const showOn = this.get(inst, 'showOn');

  if (showOn === 'focus' || showOn === 'both') {
    input.addEventListener('focus', this.showDatepicker);
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
    const dp = window.__quno__.datepicker;
    inst.trigger.addEventListener('click', () => {
      if (dp.datepickerShowing && dp.lastInput === input) {
        dp.hideDatepicker();
      } else if (dp.datepickerShowing) {
        dp.hideDatepicker();
        dp.showDatepicker(input);
      } else {
        dp.showDatepicker(input);
      }

      return false;
    });
  }
}

function get(inst, name) {
  return inst.settings[name] !== undefined
    ? this.settings[name]
    : this.defaults[name];
}

/* Pop-up the date picker for a given input field.
 * If false returned from beforeShow event handler do not show.
 * @param  input  element - the input field attached to the date picker or
 *         event - if triggered by focus
 */
function showDatepicker(input) {
  input = input.target || input;

  // Find from button/image trigger
  if (input.nodeName.toLowerCase() !== 'input') {
    input = input.parentNode.querySelector('input');
  }

  const dp = window.__quno__.datepicker;
  if (dp.isDisabledDatepicker(input) || dp.lastInput === input) {
    // Already here
    return;
  }

  const inst = dp.getInst(input);
  if (dp.curInst && dp.curInst !== inst) {
    /**
     * @todo: REVIEW / REPLACE
     */
    // dp.curInst.dpDiv.stop(true, true);
    if (inst && dp.datepickerShowing) {
      dp.hideDatepicker(dp.curInst.input);
    }
  }

  const beforeShow = dp.get(inst, 'beforeShow');
  const beforeShowSettings = beforeShow
    ? beforeShow.apply(input, [input, inst])
    : {};
  if (beforeShowSettings === false) {
    return;
  }
  datepicker_extendRemove(inst.settings, beforeShowSettings);

  inst.lastVal = null;
  dp.lastInput = input;
  dp.setDateFromField(inst);

  if (dp.inDialog) {
    // Hide cursor
    input.value = '';
  }

  if (!dp.pos) {
    // Position below input
    dp.pos = dp.findPos(input);
    // Add the height
    dp.pos[1] += input.offsetHeight;
  }

  let isFixed = false;
  let parent = input.parentElement;
  while (parent) {
    isFixed = getComputedStyle(parent).position === 'fixed';
    if (isFixed) {
      break;
    }
    parent = parent.parentElement;
  }

  let offset = { left: dp.pos[0], top: dp.pos[1] };
  dp.pos = null;

  // To avoid flashes on Firefox
  inst.dpDiv.innerHTML = null; // inst.dpDiv.empty();

  // Determine sizing offscreen
  inst.dpDiv.style.position = 'absolute';
  inst.dpDiv.style.display = 'block';
  inst.dpDiv.style.top = '-1000px';

  dp.updateDatepicker(inst);

  // Fix width for dynamic number of date pickers
  // and adjust position before showing
  offset = dp.checkOffset(inst, offset, isFixed);
  inst.dpDiv.style.position = dp.inDialog /* && $.blockUI */
    ? 'static'
    : isFixed
    ? 'fixed'
    : 'absolute';
  inst.dpDiv.style.display = 'none';
  inst.dpDiv.style.left = offset.left + 'px';
  inst.dpDiv.style.top = offset.top + 'px';

  if (!inst.inline) {
    const showAnim = dp.get(inst, 'showAnim');
    const duration = dp.get(inst, 'duration');
    inst.dpDiv.style.zIndex = datepicker_getZindex(input) + 1;
    dp.datepickerShowing = true;

    // if ($.effects && $.effects.effect[showAnim])
    // else
    // inst.dpDiv[showAnim || 'show'](showAnim ? duration : null);
    inst.dpDiv.style.display = 'block';

    if (dp.shouldFocusInput(inst)) {
      // inst.input.trigger('focus');
      // inst.input.focus()
      inst.input.dispatchEvent(new InputEvent('focus'));
    }

    dp.curInst = inst;
  }
}

/* Parse existing date and initialise date picker. */
function setDateFromField(inst, noDefault) {
  if (inst.input.value === inst.lastVal) {
    return;
  }

  const dateFormat = this.get(inst, 'dateFormat');
  let dates = (inst.lastVal = inst.input ? inst.input.value : null);
  const defaultDate = this.getDefaultDate(inst);
  let date = defaultDate;
  const settings = this.getFormatConfig(inst);

  try {
    date = this.parseDate(dateFormat, dates, settings) || defaultDate;
  } catch (err) {
    dates = noDefault ? '' : dates;
  }

  inst.selectedDay = date.getDate();
  inst.drawMonth = inst.selectedMonth = date.getMonth();
  inst.drawYear = inst.selectedYear = date.getFullYear();
  inst.currentDay = dates ? date.getDate() : 0;
  inst.currentMonth = dates ? date.getMonth() : 0;
  inst.currentYear = dates ? date.getFullYear() : 0;
  this.adjustInstDate(inst);
}

/* Parse a string value into a date object.
 * See formatDate below for the possible formats.
 *
 * @param  format string - the expected format of the date
 * @param  value string - the date in the above format
 * @param  settings Object - attributes include:
 *          shortYearCutoff  number - the cutoff year for determining the century (optional)
 *          dayNamesShort string[7] - abbreviated names of the days from Sunday (optional)
 *          dayNames    string[7] - names of the days from Sunday (optional)
 *          monthNamesShort string[12] - abbreviated names of the months (optional)
 *          monthNames    string[12] - names of the months (optional)
 * @return  Date - the extracted date value or null if value is blank
 */
function parseDate(format, value, settings) {
  if (format == null || value == null) {
    throw new Error('Invalid arguments');
  }

  value = typeof value === 'object' ? value.toString() : value + '';
  if (value === '') {
    return null;
  }

  const shortYearCutoffTemp =
    (settings ? settings.shortYearCutoff : null) ||
    this.defaults.shortYearCutoff;
  const shortYearCutoff =
    typeof shortYearCutoffTemp !== 'string'
      ? shortYearCutoffTemp
      : (new Date().getFullYear() % 100) + parseInt(shortYearCutoffTemp, 10);
  const dayNamesShort =
    (settings ? settings.dayNamesShort : null) || this.defaults.dayNamesShort;
  const dayNames =
    (settings ? settings.dayNames : null) || this.defaults.dayNames;
  const monthNamesShort =
    (settings ? settings.monthNamesShort : null) ||
    this.defaults.monthNamesShort;
  const monthNames =
    (settings ? settings.monthNames : null) || this.defaults.monthNames;

  let iValue = 0;
  let year = -1;
  let month = -1;
  let day = -1;
  let doy = -1;
  let literal = false;

  let iFormat;
  let date;
  let extra;
  let dim;

  // Check whether a format character is doubled
  const lookAhead = match => {
    const matches =
      iFormat + 1 < format.length && format.charAt(iFormat + 1) === match;
    if (matches) {
      iFormat++;
    }
    return matches;
  };

  // Extract a number from the string value
  const getNumber = match => {
    const isDoubled = lookAhead(match);
    const size =
      match === '@'
        ? 14
        : match === '!'
        ? 20
        : match === 'y' && isDoubled
        ? 4
        : match === 'o'
        ? 3
        : 2;
    const minSize = match === 'y' ? size : 1;
    const digits = new RegExp('^\\d{' + minSize + ',' + size + '}');
    const num = value.substring(iValue).match(digits);

    if (!num) {
      throw new Error('Missing number at position ' + iValue);
    }
    iValue += num[0].length;
    return parseInt(num[0], 10);
  };

  // Extract a name from the string value and convert to an index
  const getName = (match, shortNames, longNames) => {
    let index = -1;
    const names = (lookAhead(match) ? longNames : shortNames)
      .map((v, k) => [[k, v]])
      .sort((a, b) => -(a[1].length - b[1].length));

    names.forEach(pair => {
      const name = pair[1];
      if (
        value.substring(iValue, name.length).toLowerCase() ===
        name.toLowerCase()
      ) {
        index = pair[0];
        iValue += name.length;
        return false;
      }
    });

    if (index !== -1) {
      return index + 1;
    } else {
      throw new Error('Unknown name at position ' + iValue);
    }
  };

  // Confirm that a literal character matches the string value
  const checkLiteral = () => {
    if (value.charAt(iValue) !== format.charAt(iFormat)) {
      throw new Error('Unexpected literal at position ' + iValue);
    }

    iValue++;
  };

  for (iFormat = 0; iFormat < format.length; iFormat++) {
    if (literal) {
      if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
        literal = false;
      } else {
        checkLiteral();
      }
    } else {
      switch (format.charAt(iFormat)) {
        case 'd':
          day = getNumber('d');
          break;
        case 'D':
          getName('D', dayNamesShort, dayNames);
          break;
        case 'o':
          doy = getNumber('o');
          break;
        case 'm':
          month = getNumber('m');
          break;
        case 'M':
          month = getName('M', monthNamesShort, monthNames);
          break;
        case 'y':
          year = getNumber('y');
          break;
        case '@':
          date = new Date(getNumber('@'));
          year = date.getFullYear();
          month = date.getMonth() + 1;
          day = date.getDate();
          break;
        case '!':
          date = new Date((getNumber('!') - this.ticksTo1970) / 10000);
          year = date.getFullYear();
          month = date.getMonth() + 1;
          day = date.getDate();
          break;
        case "'":
          if (lookAhead("'")) {
            checkLiteral();
          } else {
            literal = true;
          }
          break;
        default:
          checkLiteral();
      }
    }
  }

  if (iValue < value.length) {
    extra = value.substr(iValue);

    if (!/^\s+/.test(extra)) {
      throw new Error('Extra/unparsed characters found in date: ' + extra);
    }
  }

  if (year === -1) {
    year = new Date().getFullYear();
  } else if (year < 100) {
    year +=
      new Date().getFullYear() -
      (new Date().getFullYear() % 100) +
      (year <= shortYearCutoff ? 0 : -100);
  }

  if (doy > -1) {
    month = 1;
    day = doy;

    do {
      dim = this.getDaysInMonth(year, month - 1);
      if (day <= dim) {
        break;
      }

      month++;
      day -= dim;

      // eslint-disable-next-line no-constant-condition
    } while (true);
  }

  date = this.daylightSavingAdjust(new Date(year, month - 1, day));
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    // E.g. 31/02/00
    throw new Error('Invalid date');
  }

  return date;
}

function findPos(el) {
  const inst = this.getInst(el);
  const isRTL = this.get(inst, 'isRTL');

  while (
    el &&
    (el.type === 'hidden' ||
      el.nodeType !== 1) /* || $.expr.pseudos.hidden(el) */
  ) {
    el = el[isRTL ? 'previousSibling' : 'nextSibling'];
  }

  const position = el.getBoundingClientRect();
  return [
    position.left + document.body.scrollTop,
    position.top + document.body.scrollLeft,
  ];
}

/* Check positioning to remain on screen. */
function checkOffset(inst, offset, isFixed) {
  const dpWidth = inst.dpDiv.offsetWidth;
  const dpHeight = inst.dpDiv.offsetHeight;
  const inputWidth = inst.input ? inst.input.offsetWidth : 0;
  const inputHeight = inst.input ? inst.input.offsetHeight : 0;
  const viewWidth =
    document.documentElement.clientWidth +
    (isFixed ? 0 : document.documentElement.scrollLeft);
  const viewHeight =
    document.documentElement.clientHeight +
    (isFixed ? 0 : document.documentElement.scrollTop);

  const inputOffset = inst.input.getBoundingClientRect();
  offset.left -= this.get(inst, 'isRTL') ? dpWidth - inputWidth : 0;
  offset.left -=
    isFixed && offset.left === inputOffset.left
      ? document.documentElement.scrollLeft
      : 0;
  offset.top -=
    isFixed && offset.top === inputOffset.top + inputHeight
      ? document.documentElement.scrollTop
      : 0;

  // Now check if datepicker is showing outside window viewport - move to a better place if so
  offset.left -= Math.min(
    offset.left,
    offset.left + dpWidth > viewWidth && viewWidth > dpWidth
      ? Math.abs(offset.left + dpWidth - viewWidth)
      : 0,
  );
  offset.top -= Math.min(
    offset.top,
    offset.top + dpHeight > viewHeight && viewHeight > dpHeight
      ? Math.abs(dpHeight - inputHeight)
      : 0,
  );

  return offset;
}

function datepicker_getZindex(elem) {
  while (elem && elem !== document) {
    // Ignore z-index if position is set to a value where z-index is ignored by the browser
    // This makes behavior of this function consistent across browsers
    // WebKit always returns auto if the element is positioned
    const cs = getComputedStyle(elem);
    const position = cs.position;

    if (
      position === 'absolute' ||
      position === 'relative' ||
      position === 'fixed'
    ) {
      // IE returns 0 when zIndex is not specified
      // other browsers return a string
      // we ignore the case of nested elements with an explicit value of 0
      // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
      const value = parseInt(cs.zIndex, 10);
      if (!isNaN(value) && value !== 0) {
        return value;
      }
    }

    elem = elem.parentElement;
  }

  return 0;
}

/* Hide the date picker from view.
 * @param  input  element - the input field attached to the date picker
 */
function hideDatepicker(input) {
  const inst = this.curInst;

  if (!inst || (input && inst !== input.datepicker)) {
    return;
  }

  if (this.datepickerShowing) {
    const showAnim = this.get(inst, 'showAnim');
    const duration = this.get(inst, 'duration');
    const postProcess = () => window.__quno__.datepicker.tidyDialog(inst);

    // inst.dpDiv[
    //   showAnim === 'slideDown'
    //     ? 'slideUp'
    //     : showAnim === 'fadeIn'
    //     ? 'fadeOut'
    //     : 'hide'
    // ](showAnim ? duration : null, postProcess);
    inst.dpDiv.style.display = 'none';

    if (!showAnim) {
      postProcess();
    }

    this.datepickerShowing = false;

    const onClose = this.get(inst, 'onClose');
    if (onClose) {
      onClose.apply(inst.input || null, [
        inst.input ? inst.input.value : '',
        inst,
      ]);
    }

    this.lastInput = null;
    if (this.inDialog) {
      this.dialogInput.style.position = 'absolute';
      this.dialogInput.style.left = '0';
      this.dialogInput.style.top = '-100px';
      // if ($.blockUI) {
      //   $.unblockUI();
      //   $('body').append(this.dpDiv);
      // }
    }
    this.inDialog = false;
  }
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

  const dp = window.__quno__.datepicker;
  const offsetString = offset => {
    try {
      return dp.parseDate(
        dp.get(inst, 'dateFormat'),
        offset,
        dp.getFormatConfig(inst),
      );
    } catch (e) {
      // Ignore
    }

    const _date =
      (offset.toLowerCase().match(/^c/) ? dp.getDate(inst) : null) ||
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
          day = Math.min(day, dp.getDaysInMonth(year, month));
          break;

        case 'y':
        case 'Y':
          year += parseInt(matches[1], 10);
          day = Math.min(day, dp.getDaysInMonth(year, month));
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
  /**
   * @todo:
   *  Generate html returns a html string.
   *  Either use innerHTML instead of appendChild
   *  or change the function to return element
   *  nodes instead.
   */
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

  const dp = window.__quno__.datepicker;
  if (
    inst === dp.curInst &&
    dp.datepickerShowing &&
    dp.shouldFocusInput(inst)
  ) {
    /**
     * @todo: Review
     */
    inst.input.focus();
  }

  // Deffered render of the years select (to avoid flashes on Firefox)
  // if (inst.yearshtml) {
  //   let origYearsHTML = inst.yearshtml;
  //   setTimeout(() => {
  //     //assure that inst.yearshtml didn't change.
  //     if (inst.yearshtml && origYearsHTML === inst.yearshtml) {
  //       inst.dpDiv
  //         .querySelector('select.ui-datepicker-year')
  //         .replaceWith(inst.yearshtml);
  //     }
  //     origYearsHTML = inst.yearshtml = null;
  //   }, 0);
  // }

  // The function above probably never runs as
  // inst.yearshtml gets modified only in the
  // generateMonthYearHeader function and where
  // it's value is also set to null at the end
  if (inst.yearshtml) {
    console.log(inst);
    console.log(inst.yearshtml);
    throw new Error('Apparent inst.yearshtml does have a value...');
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

  let prevEl;
  const canAdjustPrev = this.canAdjustMonth(inst, -1, drawYear, drawMonth);
  if (canAdjustPrev || !hideIfNoPrevNext) {
    // prevEl = document.createElement('a');
    prevEl = document.createElement('button');
    prevEl.setAttribute('class', 'ui-datepicker-prev ui-corner-all');
    prevEl.setAttribute('data-handler', 'prev');
    prevEl.setAttribute('data-event', 'click');
    prevEl.setAttribute('title', prevText);
    const span = document.createElement('span');
    span.setAttribute(
      'class',
      `ui-icon ui-icon-circle-triangle-${isRTL ? 'e' : 'w'}`,
    );
    span.textContent = prevText;
    prevEl.appendChild(span);
  }
  if (!canAdjustMonth && !hideIfNoPrevNext) {
    prevEl.classList.add('ui-state-disabled');
  }

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

  let nextEl;
  const canAdjustNext = this.canAdjustMonth(inst, +1, drawYear, drawMonth);
  if (canAdjustNext || !hideIfNoPrevNext) {
    // nextEl = document.createElement('a');
    nextEl = document.createElement('button');
    nextEl.setAttribute('class', 'ui-datepicker-next ui-corner-all');
    nextEl.setAttribute('data-handler', 'next');
    nextEl.setAttribute('data-event', 'click');
    nextEl.setAttribute('title', nextText);
    const span = document.createElement('span');
    span.setAttribute(
      'class',
      `ui-icon ui-icon-circle-triangle-${isRTL ? 'w' : 'e'}`,
    );
    span.textContent = nextText;
    nextEl.appendChild(span);
  }

  if (!canAdjustNext && !hideIfNoPrevNext) {
    nextEl.classList.add('ui-state-disabled');
  }

  let currentText = this.get(inst, 'currentText');
  const gotoDate =
    this.get(inst, 'gotoCurrent') && inst.currentDay ? currentDate : today;
  currentText = !navigationAsDateFormat
    ? currentText
    : this.formatDate(currentText, gotoDate, this.getFormatConfig(inst));

  let controlsEl;
  if (!inst.inline) {
    controlsEl = document.createElement('button');
    controlsEl.setAttribute('type', 'button');
    controlsEl.setAttribute(
      'class',
      'ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all',
    );
    controlsEl.setAttribute('data-handler', 'hide');
    controlsEl.setAttribute('data-event', 'click');
    controlsEl.textContent = this.get(inst, 'closeText');
  }

  let buttonPanelEl;
  if (showButtonPanel) {
    buttonPanelEl = document.createElement('div');
    buttonPanelEl.setAttribute(
      'class',
      'ui-datepicker-buttonpanel ui-widget-content',
    );
    if (isRTL) {
      buttonPanelEl.appendChild(controlsEl);
    }
    if (this.isInRange(inst, gotoDate)) {
      const btn = document.createElement('button');
      btn.setAttribute('type', 'buton');
      btn.setAttribute(
        'class',
        'ui-datepicker-current ui-state-default ui-priority-secondary ui-corner-all',
      );
      btn.setAttribute('data-handler', 'today');
      btn.setAttribute('data-event', 'click');
      btn.textContent = currentText;
      buttonPanelEl.appendChild(btn);
    }
    if (!isRTL) {
      buttonPanelEl.appendChild(controlsEl);
    }
  }

  let firstDay = parseInt(this.get(inst, 'firstDay'), 10);
  firstDay = isNaN(firstDay) ? 0 : firstDay;

  const showWeek = this.get(inst, 'showWeek');
  const dayNames = this.get(inst, 'dayNames');
  const dayNamesMin = this.get(inst, 'dayNamesMin');
  const monthNames = this.get(inst, 'monthNames');
  const monthNamesShort = this.get(inst, 'monthNamesShort');
  const beforeShowDay = this.get(inst, 'beforeShowDay');
  const showOtherMonths = this.get(inst, 'showOtherMonths');
  const selectOtherMonths = this.get(inst, 'selectOtherMonths');
  const defaultDate = this.getDefaultDate(inst);
  const htmlEl = document.createDocumentFragment();

  for (let row = 0; row < numMonths[0]; row++) {
    const groupEl = document.createDocumentFragment();
    this.maxRows = 4;
    for (let col = 0; col < numMonths[1]; col++) {
      const selectedDate = this.daylightSavingAdjust(
        new Date(drawYear, drawMonth, inst.selectedDay),
      );
      let cornerClass = 'ui-corner-all';
      const calenderEl = isMultiMonth
        ? document.createElement('div')
        : document.createDocumentFragment();

      if (isMultiMonth) {
        calenderEl.classList.add('ui-datepicker-group');

        if (numMonths[1] > 1) {
          switch (col) {
            case 0:
              calenderEl.classList.add('ui-datepicker-group-first');
              cornerClass = ' ui-corner-' + (isRTL ? 'right' : 'left');
              break;
            case numMonths[1] - 1:
              calenderEl.classList.add('ui-datepicker-group-last');
              cornerClass = ' ui-corner-' + (isRTL ? 'left' : 'right');
              break;
            default:
              calenderEl.classList.add('ui-datepicker-group-middle');
              cornerClass = '';
              break;
          }
        }
      }

      const header = document.createElement('div');
      header.setAttribute(
        'class',
        `ui-datepicker-header ui-widget-header ui-helper-clearfix ${cornerClass}`,
      );
      if (/all|left/.test(cornerClass) && row === 0) {
        header.appendChild(isRTL ? nextEl : prevEl);
      }

      if (/all|right/.test(cornerClass) && row === 0) {
        header.appendChild(isRTL ? prevEl : nextEl);
      }

      const monthYearHeader = this.generateMonthYearHeader(
        inst,
        drawMonth,
        drawYear,
        minDate,
        maxDate,
        row > 0 || col > 0,
        monthNames,
        monthNamesShort,
      );
      header.appendChild(monthYearHeader);
      calenderEl.appendChild(header);

      const tableEl = document.createElement('table');
      tableEl.setAttribute('class', 'ui-datepicker-calendar');
      const theadEl = document.createElement('thead');
      const trEl = document.createElement('tr');
      theadEl.appendChild(trEl);

      if (showWeek) {
        const th = document.createElement('th');
        th.setAttribute('class', 'ui-datepicker-week-col');
        th.textContent = this.get(inst, 'weekHeader');
        trEl.appendChild(th);
      }

      // Days of the week
      for (let dow = 0; dow < 7; dow++) {
        const day = (dow + firstDay) % 7;
        const th = document.createElement('th');
        th.setAttribute('scope', 'col');
        if ((dow + firstDay + 6) % 7 >= 5) {
          th.setAttribute('class', 'ui-datepicker-week-end');
        }
        const span = document.createElement('span');
        span.setAttribute('title', dayNames[day]);
        span.textContent = dayNamesMin[day];
        th.appendChild(span);
        theadEl.appendChild(th);
      }

      tableEl.appendChild(theadEl);

      const daysInMonth = this.getDaysInMonth(drawYear, drawMonth);

      if (drawYear === inst.selectedYear && drawMonth === inst.selectedMonth) {
        inst.selectedDay = Math.min(inst.selectedDay, daysInMonth);
      }
      const leadDays =
        (this.getFirstDayOfMonth(drawYear, drawMonth) - firstDay + 7) % 7;

      // Calculate the number of rows to generate
      const curRows = Math.ceil((leadDays + daysInMonth) / 7);
      //If multiple months, use the higher number of rows (see #7043)
      const numRows = isMultiMonth
        ? this.maxRows > curRows
          ? this.maxRows
          : curRows
        : curRows;
      this.maxRows = numRows;
      let printDate = this.daylightSavingAdjust(
        new Date(drawYear, drawMonth, 1 - leadDays),
      );

      const tbodyEl = document.createElement('tbody');

      // Create datepicker rows
      for (let dRow = 0; dRow < numRows; dRow++) {
        const tr = document.createElement('tr');
        if (showWeek) {
          const td = document.createElement('td');
          td.setAttribute('class', 'ui-datepicker-week-col');
          td.textContent = this.get(inst, 'calculateWeek')(printDate);
          tr.appendChild(td);
        }

        // Create datepicker days
        for (let dow = 0; dow < 7; dow++) {
          const daySettings = beforeShowDay
            ? beforeShowDay.apply(inst.input || null, [printDate])
            : [true, ''];
          const otherMonth = printDate.getMonth() !== drawMonth;
          const unselectable =
            (otherMonth && !selectOtherMonths) ||
            !daySettings[0] ||
            (minDate && printDate < minDate) ||
            (maxDate && printDate > maxDate);

          const td = document.createElement('td');
          if ((dow + firstDay + 6) % 7 >= 5) {
            td.classList.add('ui-datepicker-week-end');
          }
          if (otherMonth) {
            td.classList.add('ui-datepicker-other-month');
          }
          if (
            (printDate.getTime() === selectedDate.getTime() &&
              drawMonth === inst.selectedMonth &&
              inst._keyEvent) || // user pressed key
            (defaultDate.getTime() === printDate.getTime() &&
              defaultDate.getTime() === selectedDate.getTime())
          ) {
            td.classList.add(this.dayOverClass);
          }
          if (unselectable) {
            td.classList.add(this.unselectableClass);
            td.classList.add('ui-state-disabled');
          }
          if (!otherMonth || showOtherMonths) {
            if (daySettings[1]) {
              td.classList.add(daySettings[1]);
            }
            if (printDate.getTime() === currentDate.getTime()) {
              td.classList.add(this.currentClass);
            }
            if (printDate.getTime() === today.getTime()) {
              td.classList.add('ui-datepicker-today');
            }
          }
          if ((!otherMonth || showOtherMonths) && daySettings[2]) {
            td.setAttribute('title', daySettings[2].replace(/'/g, '&#39;'));
          }
          if (!unselectable) {
            td.setAttribute('data-handler', 'selectDay');
            td.setAttribute('data-event', 'click');
            td.setAttribute('data-month', printDate.getMonth());
            td.setAttribute('data-year', printDate.getFullYear());
          }
          if (otherMonth && !showOtherMonths) {
            td.innerHTML = '&#xa0;';
          } else {
            if (unselectable) {
              const span = document.createElement('span');
              span.setAttribute('class', 'ui-state-default');
              span.textContent = printDate.getDate();
              td.appendChild(span);
            } else {
              // const a = document.createElement('a');
              const a = document.createElement('button');
              a.setAttribute('class', 'ui-state-default');
              if (printDate.getTime() === today.getTime()) {
                a.classList.add('ui-state-highlight');
              }
              if (printDate.getTime() === currentDate.getTime()) {
                a.classList.add('ui-state-active');
              }
              if (otherMonth) {
                a.classList.add('ui-priority-secondary');
              }
              // a.setAttribute('href', '#');
              a.textContent = printDate.getDate();
              td.appendChild(a);
            }
          }
          tr.appendChild(td);
          printDate.setDate(printDate.getDate() + 1);
          printDate = this.daylightSavingAdjust(printDate);
        }
        tbodyEl.appendChild(tr);
      }
      drawMonth++;
      if (drawMonth > 11) {
        drawMonth = 0;
        drawYear++;
      }
      tableEl.appendChild(tbodyEl);
      calenderEl.appendChild(tableEl);
      groupEl.appendChild(calenderEl);

      if (isMultiMonth && numMonths[0] > 0 && col === numMonths[1] - 1) {
        const div = document.createElement('div');
        div.setAttribute('class', 'ui-datepicker-row-break');
        groupEl.appendChild(div);
      }
    }
    htmlEl.appendChild(groupEl);
  }
  if (buttonPanelEl) {
    htmlEl.appendChild(buttonPanelEl);
  }
  inst.keyEvent = false;

  return htmlEl;
}

/* Determine the number of months to show. */
function getNumberOfMonths(inst) {
  const numMonths = this.get(inst, 'numberOfMonths');
  return numMonths == null
    ? [1, 1]
    : typeof numMonths === 'number'
    ? [1, numMonths]
    : numMonths;
}

/* Determines if we should allow a "next/prev" month display change. */
function canAdjustMonth(inst, offset, curYear, curMonth) {
  const numMonths = this.getNumberOfMonths(inst);
  const date = this.daylightSavingAdjust(
    new Date(
      curYear,
      curMonth + (offset < 0 ? offset : numMonths[0] * numMonths[1]),
      1,
    ),
  );

  if (offset < 0) {
    date.setDate(this.getDaysInMonth(date.getFullYear(), date.getMonth()));
  }

  return this.isInRange(inst, date);
}

/* Is the given date in the accepted range? */
function isInRange(inst, date) {
  const minDate = this.getMinMaxDate(inst, 'min');
  const maxDate = this.getMinMaxDate(inst, 'max');
  let minYear = null;
  let maxYear = null;
  let years = this.get(inst, 'yearRange');

  if (years) {
    const yearSplit = years.split(':');
    const currentYear = new Date().getFullYear();
    minYear = parseInt(yearSplit[0], 10);
    maxYear = parseInt(yearSplit[1], 10);

    if (yearSplit[0].match(/[+-].*/)) {
      minYear += currentYear;
    }
    if (yearSplit[1].match(/[+-].*/)) {
      maxYear += currentYear;
    }
  }

  return (
    (!minDate || date.getTime() >= minDate.getTime()) &&
    (!maxDate || date.getTime() <= maxDate.getTime()) &&
    (!minYear || date.getFullYear() >= minYear) &&
    (!maxYear || date.getFullYear() <= maxYear)
  );
}

/* Generate the month and year header. */
function generateMonthYearHeader(
  inst,
  drawMonth,
  drawYear,
  minDate,
  maxDate,
  secondary,
  monthNames,
  monthNamesShort,
) {
  const changeMonth = this.get(inst, 'changeMonth');
  const changeYear = this.get(inst, 'changeYear');
  const showMonthAfterYear = this.get(inst, 'showMonthAfterYear');
  const htmlEl = document.createElement('div');
  htmlEl.setAttribute('class', 'ui-datepicker-title');
  let monthEl;

  // Month selection
  if (secondary || !changeMonth) {
    monthEl = document.createElement('span');
    monthEl.setAttribute('class', 'ui-datepicker-month');
    monthEl.textContent = monthNames[drawMonth];
  } else {
    let inMinYear = minDate && minDate.getFullYear() === drawYear;
    let inMaxYear = maxDate && maxDate.getFullYear() === drawYear;
    monthEl = document.createElement('select');
    monthEl.setAttribute('class', 'ui-datepicker-month');
    monthEl.setAttribute('data-handler', 'selectMonth');
    monthEl.setAttribute('data-event', 'change');

    for (let month = 0; month < 12; month++) {
      if (
        (!inMinYear || month >= minDate.getMonth()) &&
        (!inMaxYear || month <= maxDate.getMonth())
      ) {
        const option = document.createElement('option');
        option.setAttribute('value', month);
        if (month === drawMonth) {
          option.setAttribute('selected', 'selected');
        }
        option.textContent = monthNamesShort[month];
        monthEl.appendChild(option);
      }
    }
  }

  if (!showMonthAfterYear) {
    htmlEl.appendChild(monthEl);
    if (secondary || !(changeMonth && changeYear)) {
      htmlEl.appendChild(document.createTextNode('\u00a0'));
    }
  }

  // Year selection
  if (!inst.yearshtml) {
    inst.yearshtml = '';
    if (secondary || !changeYear) {
      const span = document.createElement('span');
      span.setAttribute('class', 'ui-datepicker-year');
      span.textContent = drawYear;
      htmlEl.appendChild(span);
    } else {
      // Determine range of years to display
      const years = this.get(inst, 'yearRange').split(':');
      const thisYear = new Date().getFullYear();

      const determineYear = value => {
        const year = value.match(/c[+-].*/)
          ? drawYear + parseInt(value.substring(1), 10)
          : value.match(/[+-].*/)
          ? thisYear + parseInt(value, 10)
          : parseInt(value, 10);

        return isNaN(year) ? thisYear : year;
      };

      let year = determineYear(years[0]);
      let endYear = Math.max(year, determineYear(years[1] || ''));
      year = minDate ? Math.max(year, minDate.getFullYear()) : year;
      endYear = maxDate ? Math.min(endYear, maxDate.getFullYear()) : endYear;
      const select = document.createElement('select');
      select.setAttribute('class', 'ui-datepicker-year');
      select.setAttribute('data-handler', 'selectYear');
      select.setAttribute('data-event', 'change');
      for (; year <= endYear; year++) {
        const option = document.createElement('option');
        option.setAttribute('value', year);
        if (year === drawYear) {
          option.setAttribute('selected', 'selected');
        }
        option.textContent = year;
        select.appendChild(option);
      }
      htmlEl.appendChild(select);
    }
  }

  if (this.get(inst, 'yearSuffix')) {
    htmlEl.appendChild(document.createTextNode(this.get(inst, 'yearSuffix')));
  }
  if (showMonthAfterYear) {
    if (secondary || !(changeMonth && changeYear)) {
      htmlEl.appendChild(document.createTextNode('\u00a0'));
    }
    htmlEl.appendChild(monthEl);
  }
  return htmlEl;
}

/* Find the day of the week of the first of a month. */
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/* Attach the onxxx handlers. These are declared statically so
 * they work with static code transformers like Caja.
 */
function attachHandlers(inst) {
  const stepMonths = this.get(inst, 'stepMonths');
  const id = `#${inst.id.replace(/\\\\/g, '\\')}`;
  const dp = window.__quno__.datepicker;

  Array.from(inst.dpDiv.querySelectorAll('[data-handler]'), el => {
    const handler = {
      prev() {
        dp.adjustDate(id, -stepMonths, 'M');
      },
      next() {
        dp.adjustDate(id, +stepMonths, 'M');
      },
      hide() {
        dp.hideDatepicker();
      },
      today() {
        dp.gotoToday(id);
      },
      selectDay() {
        dp.selectDay(
          id,
          +el.getAttribute('data-month'),
          +el.getAttribute('data-year'),
          el,
        );
        return false;
      },
      selectMonth() {
        dp.selectMonthYear(id, el, 'M');
        return false;
      },
      selectYear() {
        dp.selectMonthYear(id, el, 'Y');
        return false;
      },
    };
    el.addEventListener(
      el.getAttribute('data-event'),
      handler[el.getAttribute('data-handler')],
    );
  });
}

/* Adjust one of the date sub-fields. */
function adjustDate(id, offset, period) {
  const target = document.querySelector(id);
  const inst = this.getInst(target);

  if (this.isDisabledDatepicker(target)) {
    return;
  }

  this.adjustInstDate(inst, offset, period);
  this.updateDatepicker(inst);
}

/* Retrieve the instance data for the target control.
 * @param  target  element - the target input field or division or span
 * @return  object - the associated instance data
 * @throws  error if a jQuery problem getting data
 */
function getInst(target) {
  try {
    return target.datepicker;
  } catch (err) {
    throw new Error('Missing instace data for this datepicker');
  }
}

/* Is the first field in a jQuery collection disabled as a datepicker?
 * @param  target	element - the target input field or division or span
 * @return boolean - true if disabled, false if enabled
 */
function isDisabledDatepicker(target) {
  if (!target) {
    return false;
  }

  return this.disabledInputs.includes(target);
}

/* Tidy up after a dialog display. */
function tidyDialog(inst) {
  inst.dpDiv.classList.remove(this.dialogClass);
  /**
   * @todo: REVIEW
   */
  // inst.dpDiv.removeClass( this._dialogClass ).off( ".ui-datepicker-calendar" );
  // inst.dpDiv.removeEventListener('.ui-datepicker-calendar') ???;
}

/* Action for current link. */
function gotoToday(id) {
  const target = document.querySelector(id);
  const inst = this.getInst(target);

  if (this.get(inst, 'gotoCurrent') && inst.currentDay) {
    inst.selectedDay = inst.currentDay;
    inst.drawMonth = inst.selectedMonth = inst.currentMonth;
    inst.drawYear = inst.selectedYear = inst.currentYear;
  } else {
    const date = new Date();
    inst.selectedDay = date.getDate();
    inst.drawMonth = inst.selectedMonth = date.getMonth();
    inst.drawYear = inst.selectedYear = date.getFullYear();
  }

  this.notifyChange(inst);
  this.adjustDate(target);
}

/* Action for selecting a day. */
function selectDay(id, month, year, td) {
  const target = document.querySelector(id);

  if (
    td.classList.contains(this.unselectableClass) ||
    this.isDisabledDatepicker(target)
  ) {
    return;
  }

  const inst = this.getInst(target);
  // inst.selectedDay = inst.currentDay = td.querySelector('a').innerHTML;
  inst.selectedDay = inst.currentDay = td.querySelector('button').textContent;
  inst.selectedMonth = inst.currentMonth = month;
  inst.selectedYear = inst.currentYear = year;
  this.selectDate(
    id,
    this._formatDate(
      inst,
      inst.currentDay,
      inst.currentMonth,
      inst.currentYear,
    ),
  );
}

/* Update the input field with the selected date. */
function selectDate(id, dateStr) {
  const target = typeof id === 'string' ? document.querySelector(id) : id;
  const inst = this.getInst(target);

  dateStr = dateStr != null ? dateStr : this._formatDate(inst);

  if (inst.input) {
    inst.input.value = dateStr;
  }

  this.updateAlternate(inst);

  const onSelect = this.get(inst, 'onSelect');
  if (onSelect) {
    // Trigger custom callback
    onSelect.apply(inst.input || null, [dateStr, inst]);
  } else if (inst.input) {
    // Fire the change event
    // inst.input.trigger('change')
    inst.input.dispatchEvent(new InputEvent('change'));
  }

  if (inst.inline) {
    this.updateDatepicker(inst);
  } else {
    this.hideDatepicker();
    this.lastInput = inst.input;
    if (typeof inst.input !== 'object') {
      /**
       * @todo: REVIEW
       */
      // inst.input.trigger('focus');
      inst.input.dispatchEvent(new InputEvent('focus')); // ???
    }
    this.lastInput = null;
  }
}

/* Update any alternate field to synchronise with the main field. */
function updateAlternate(inst) {
  const altField = this.get(inst, 'altField');

  if (!altField) {
    return;
  }
  // Update alternate field too
  const altFormat = this.get(inst, 'altFormat') || this.get(inst, 'dateFormat');
  const date = this.getDate(inst);
  const dateStr = this.formatDate(altFormat, date, this.getFormatConfig(inst));
  altField.value = dateStr;
}

/* Action for selecting a new month/year. */
function selectMonthYear(id, select, period) {
  const target = document.querySelector(id);
  const inst = this.getInst(target);

  const monthOrYear = period === 'M' ? 'Month' : 'Year';
  inst['selected' + monthOrYear] = inst['draw' + monthOrYear] = parseInt(
    select.options[select.selectedIndex].value,
    10,
  );

  this.notifyChange(inst);
  this.adjustDate(target);
}

// #6694 - don't focus the input if it's already focused
// this breaks the change event in IE
function shouldFocusInput(inst) {
  // return (inst.input && inst.input.is(':visible') && !inst.input.is(':disabled') &&  !inst.input.is(':focus'));
  return document.activeElement !== inst.input;
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

  return dpDiv;
}

function datepicker_handleMouseOver(evt) {
  let target = evt ? evt.target : this;
  const selector =
    'button, .ui-datepicker-prev, .ui-datepicker-next, .ui-datepicker-calendar td a';
  if (!target.matches(selector)) {
    if (!target.closest(selector)) {
      return;
    } else {
      target = target.closest(selector);
    }
  }

  if (
    !window.__quno__.datepicker.isDisabledDatepicker(
      datepicker_instActive.inline
        ? datepicker_instActive.dpDiv.parentElement
        : datepicker_instActive.input,
    )
  ) {
    /**
     * @todo: REVIEW
     */
    const calendar = target.closest('.ui-datepicker-calendar');
    if (calendar) {
      const hover = calendar.querySelector('a.ui-state-hover');
      hover && hover.classList.remove('ui-state-hover');
    }
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

function datepicker_extendRemove(target, props) {
  target = Object.assign(target, props);

  for (const name in props) {
    if (props[name] == null) {
      target[name] = props[name];
    }
  }
  return target;
}

/* Close date picker if clicked elsewhere. */
function checkExternalClick(event) {
  const dp = window.__quno__.datepicker;
  if (!dp.curInst) {
    return;
  }

  const { target } = event;
  const inst = dp.getInst(target);

  if (
    (target.id !== dp.mainDivId &&
      !target.closest(`#${dp.mainDivId}`) &&
      !target.classList.contains(dp.markerClassName) &&
      !target.closest(`.${dp.triggerClass}`)) ||
    (target.classList.contains(dp.markerClassName) && dp.curInst !== inst)
  ) {
    dp.hideDatepicker();
  }
}

// Return $.datepicker

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
proto.showDatepicker = showDatepicker;
proto.setDateFromField = setDateFromField;
proto.parseDate = parseDate;
proto.findPos = findPos;
proto.checkOffset = checkOffset;
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
proto.getNumberOfMonths = getNumberOfMonths;
proto.canAdjustMonth = canAdjustMonth;
proto.isInRange = isInRange;
proto.generateMonthYearHeader = generateMonthYearHeader;
proto.getFirstDayOfMonth = getFirstDayOfMonth;
proto.attachHandlers = attachHandlers;
proto.adjustDate = adjustDate;
proto.getInst = getInst;
proto.isDisabledDatepicker = isDisabledDatepicker;
proto.hideDatepicker = hideDatepicker;
proto.tidyDialog = tidyDialog;
proto.gotoToday = gotoToday;
proto.selectDay = selectDay;
proto.selectDate = selectDate;
proto.updateAlternate = updateAlternate;
proto.selectMonthYear = selectMonthYear;
proto.shouldFocusInput = shouldFocusInput;
proto.checkExternalClick = checkExternalClick;

// TBD
proto.widgetDatePicker = widgetDatePicker;
proto.setDefaults = setDefaults;

/* Invoke the datepicker functionality. ($.fn.datepicker)
 *  @param  options  string - a command, optionally followed by additional parameters
 *  or Object - settings for attaching new datepicker functionality
 *  @return  jQuery object
 */
const datepicker = function(selectorOrInput, options) {
  // Verify an empty collection wasn't passed - Fixes #6976
  if (!selectorOrInput) {
    throw new Error(
      'Cannot initialize datepicker: missing input element or selector.',
    );
  }

  const element =
    typeof selectorOrInput === 'string'
      ? document.querySelector(selectorOrInput)
      : selectorOrInput;

  const dp = window.__quno__.datepicker;

  // Initialise the date picker
  if (!dp.initialized) {
    document.addEventListener('mousedown', dp.checkExternalClick);
    dp.initialized = true;
  }

  // Append datepicker main container to body if not exist
  if (!document.getElementById(dp.mainDivId)) {
    document.body.appendChild(dp.dpDiv);
  }

  const otherArgs = Array.prototype.slice.call(arguments, 1);
  if (
    typeof options === 'string' &&
    (options === 'isDisabled' || options === 'getDate' || options === 'widget')
  ) {
    return dp[`${options}Datepicker`].apply(dp, [this].concat(otherArgs));
  }

  if (
    options === 'option' &&
    arguments.length === 2 &&
    typeof arguments[1] === 'string'
  ) {
    return dp[`${options}Datepicker`].apply(dp, [this].concat(otherArgs));
  }

  return [element].forEach(function(el) {
    typeof options === 'string'
      ? dp[`${options}Datepicker`].apply(dp, [element].concat(otherArgs))
      : dp.attachDatepicker(el, options);
  });
};

// Singleton instance
window.__quno__ = window.__quno__ || {};
window.__quno__.datepicker = new DatePicker();
window.__quno__.datepicker.initialized = false;
window.__quno__.datepicker.uuid = new Date().getTime();
window.__quno__.datepicker.version = '@VERSION';

export { datepicker };

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
    // let newAnchor = newTd && newTd.querySelector('a');
    let newAnchor = newTd && newTd.querySelector('button');

    while (!newAnchor) {
      currentIdx--;
      newTd = newCells[currentIdx];
      // newAnchor = newTd && newTd.querySelector('a');
      newAnchor = newTd && newTd.querySelector('button');
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
