// ===================================================================
// Source code adapted (vanilla) from jQuery UI Datepicker:
// https://github.com/jquery/jquery-ui/blob/master/ui/widgets/datepicker.js
// Dependencies: jQuery, jQuery UI
// ===================================================================

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
  this.appendClass =  'ui-datepicker-append';
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
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthNamesShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    weekHeader: 'Wk',
    dateFormat: 'mm/dd/yy',
    firstDay: 0,
    isRTL: false,
    // True if the year select precedes month, false for month then year
    showMonthAfterYear: false,
    // Additional text to append to the year in the month headers
    yearSuffix: ''
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
    disabled: false
  };
  
  this.defaults = Object.assign(this.defaults, this.regional['']);
  this.regional.en = JSON.parse(JSON.stringify(this.regional['']));
  this.regional['en-US'] = JSON.parse(JSON.stringify(this.regional['']));
  const html = `<div id="${this._mainDivId}" class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>`;
  this.dpDiv = datepicker_bindHover(html);
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
  const id = target.id.replace(/([^A-Za-z0-9_\-])/g, "\\\\$1" );
  const html = `<div class="${this._inlineClass} ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all"></div>`;
  return {
    id,
    input: target,
    selectedDay: 0,
    selectedMonth: 0,
    selectedYear: 0,
    drawMonth: 0,
    drawYear: 0,
    inline,
    dpDiv: !inline ? this.dpDiv : datepicker_bindHover(html)
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
    input.insertAdjacentElement(isRTL ? 'beforebegin' : 'afterend', inst.append );
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
        button.innerText = buttonText;
      }
      inst.trigger = btn;
    }

    input.insertAdjacentElement(isRTL ? 'beforebegin' : 'afterend', inst.trigger );
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

function autoSize(inst) {
  if (this.get(inst, 'autoSize') && !inst.inline) {
    // Ensure double digits
    const date = new Date(2009, 12 - 1, 20);
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
      const monthFormat = dateFormat.match(/MM/) ? 'monthNames' : 'monthNamesShort';
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
    ? (typeof day === 'object' ? day : this.daylightSavingsAdjust(new Date(year, month, day)))
    : this.daylightSavingsAdjust(new Date(inst.currentYear, inst.currentMonth, inst.currentDay));

  return this.formatDate(this.get(inst, 'dateFormat'), date, this.getFormatConfig(inst));
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
    monthNames = this.defaults.monthNames
  } = settings;
}



function get(inst, name) {
  return inst.settings[name] !== undefined
    ? this.settings[name] : this._defaults[name];
}

function generateHTML(inst) {
  const tempDate = new Date();
  const today = this.daylightSavingsAdjust(
    // Clear time from date
    new Date(
      tempDate.getFullYear(),
      tempDate.getMonth(),
      tempDate.getDate()
    )
  );
  const isRTL = this.get(inst, 'isRTL');
  const showButtonPanel = this.get(inst, 'showButtonPanel');
  const hideIfNoPrevNext = this.get(inst, 'hideIfNoPrevNext');
}

// TODO rename to "widget" when switching to widget factory
function widgetDatePicker() {
  return this.dpDiv;
}

/* Override the default settings for all instances of the date picker.
* @param  settings  object - the new settings to use as defaults (anonymous object)
* @return the manager object
*/
function setDefaults(settings) {
  datepicker_extendRemove(this.defaults, settings || {});
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
proto.autoSize = autoSize;
proto.formatDate = formatDate;

proto.widgetDatePicker = widgetDatePicker;
proto.setDefaults = setDefaults;
proto.get = get;
proto.generateHTML = generateHTML;

// ===================================================================
//
//  END DATE PICKER UI
//
// ====================================================================


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
   const trigger = document.querySelector('.ui-datepicker-trigger')
   if (trigger) {
     trigger.addEventListener('click', onTriggerClick);
   }
}

function onTriggerClick() {
  setTimeout(() => {
    let today = document.querySelector('.ui-datepicker-today a');
    
    if (!today) {
      today = document.querySelector('.ui-state-active') || document.querySelector('.ui-state-default');
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
  
  if (!container || !input) {
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
      activeDate = document.querySelector('.ui-state-highlight') || document.querySelector('.ui-state-active');
      
      if (activeDate) {
        activeDate.focus();
      }
    }
    
  // TAB
  } else if ( which === 9) {
    evt.preventDefault();
    
    // Close button
    if (target.classList.contains('ui-datepicker-close')) {
       activeDate = document.querySelector('.ui-state-highlight') || document.querySelector('.ui-state-active');
      
      if (activeDate) {
        activeDate.focus();
      }
    
    } else if (target.classList.contains('ui-state-default')) {
      document.querySelector('.ui-datepicker-next').focus();
      
    } else if(target.classList.contains('ui-datepicker-next')) {
      document.querySelector('.ui-datepicker-prev').focus();
      
    } else if(target.classList.contains('ui-datepicker-prev')) {
      document.querySelector('.ui-datepicker-close').focus();
    }
    
  // LEFT arrow
  } else if (which === 37) {
    // If we're on a date link
    if (!target.classList.contains('ui-datepicker-close') && target.classList.contains('ui-state-default')) {
      evt.preventDefault();
      previousDay(target);
    }
  
  // RIGHT arrow
  } else if (which === 39) {
    // If we're on a date link
    if (!target.classList.contains('ui-datepicker-close') && target.classList.contains('ui-state-default')) {
      evt.preventDefault();
      nextDay(target);
    }
    
  // UP arrow
  } else if (which === 38) {
    if (!target.classList.contains('ui-datepicker-close') && target.classList.contains('ui-state-default')) {
      evt.preventDefault();
      upHandler(target, container, prev);
    }
    
  // DOWN arrow
  } else if (which === 40) {
    if (!target.classList.contains('ui-datepicker-close') && target.classList.contains('ui-state-default')) {
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
    if (target.classList.contains('ui-datepicker-prev') || target.classList.contains('ui-datepicker-next')) {
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
    const firstOfMonth = target.closest('tbody').querySelector('.ui-state-default');
    
    if (firstOfMonth) {
      firstOfMonth.focus();
      setHighlightState(firstOfMonth, document.querySelector('#ui-datepicker-div'));
    }
    
  // END
  } else if (which === 35) {
    const $daysOfMonth = target.closest('tbody').querySelectorAll('.ui-state-default');
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
  const button = dir === 'next'
    ? document.querySelector('.ui-datepicker-next')
    : document.querySelector('.ui-datepicker-prev');
  
  if (!button) {
    return;
  }
  
  const ENABLED_SELECTOR = '#ui-datepicker-div tbody td:not(.ui-state-disabled)';
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
    const lastRowTdLinks = trs[trs.length - 1].querySelectorAll('td a.ui-state-default');
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
  const rowLinks = Array.from(rowContext.querySelectorAll('a.ui-state-default'));
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
  const cleanUps = Array.from(
    document.querySelectorAll('.amaze-date'),
    clean => clean.parentNode.removeChild(clean)
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
      const monthName = datePickDiv.querySelector('.ui-datepicker-month').innerHTML;
      const year = datePickDiv.querySelector('.ui-datepicker-year').innerHTML;
      const number = date.innerHTML;
      
      if (!daySpan || !monthName || !number || !year) {
        return;
      }
      
      // AT Reads: { month } { date } { year } { day }
      // "December 18 2014 Thursday"
      const dateText = date.innerHTML + ' ' + monthName + ' ' + year + ' ' + daySpan.title;
      
      // AT Reads: { date(number) } { name of day } { name of month } { year(number) }
      // const dateText = date.innerHTML + ' ' + daySpan.title + ' ' + monthName + ' ' + year;
      
      // Add an aria-label to the date link reading out the currently focused date
      date.setAttribute('aria-label', dateText);
  });
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
  const highlight = cage.querySelector('.ui-state-highlight') || cage.querySelector('.ui-state-default');
  
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
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'
  ];
  
  const currentMonth = document.querySelector('.ui-datepicker-title .ui-datepicker-month').textContent.toLowerCase();
  const monthIndex = months.findIndex(month => month === currentMonth);
  let currentYear = document.querySelector('.ui-datepicker-title .ui-datepicker-year').textContent.toLowerCase();
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
    : 'Previous Month, ' + firstToCap(months[adjacentIndex]) + ' ' + currentYear;
  
  button.querySelector('.ui-icon').innerHTML = buttonText;
}

// Capitalize first letter
function firstToCap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
