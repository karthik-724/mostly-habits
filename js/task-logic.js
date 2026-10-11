// Task helpers: time formatting, which Home section a task belongs to, priority.
// Needs store.js (DAY_NAMES) and streak.js (date helpers, EVENING_HOUR) first.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TASK_SOON_MINUTES = 120; // a timed task turns red this long before it starts

function parseHM(s) {
  const p = s.split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function fmtParts(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return { t: ((h % 12) || 12) + ':' + String(m).padStart(2, '0'), ap: h >= 12 ? 'PM' : 'AM' };
}

// '15:00','16:00' -> '3:00 – 4:00 PM';  '11:30','13:00' -> '11:30 AM – 1:00 PM'
function formatTimeRange(start, end) {
  const a = fmtParts(parseHM(start));
  const b = fmtParts(parseHM(end));
  return a.ap === b.ap ? a.t + ' – ' + b.t + ' ' + b.ap : a.t + ' ' + a.ap + ' – ' + b.t + ' ' + b.ap;
}

function nowMinutes() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function weekEndOf(today) { return shiftDay(weekStart(today), 6); } // Saturday

function sortTasks(list) {
  const key = t => t.date + ' ' + (t.allDay ? '00:00' : t.start);
  return list.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
}

// 'today'  : due today, plus overdue tasks that are not done yet
// 'week'   : due later this week (until Saturday)
// 'later'  : due after this week
// 'past'   : finished tasks from earlier days
function taskBucket(t, today) {
  if (t.date < today) return t.done ? 'past' : 'today';
  if (t.date === today) return 'today';
  return t.date <= weekEndOf(today) ? 'week' : 'later';
}

function taskDayLabel(date, today) {
  if (date === today) return 'Today';
  if (date === shiftDay(today, 1)) return 'Tomorrow';
  const d = parseDateStr(date);
  return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
}

// Text shown next to the clock. Today's tasks show only the time on Home;
// pass alwaysDate to include the day (Tasks page, later-this-week tasks).
function taskMeta(t, today, alwaysDate) {
  const time = t.allDay ? 'All day' : formatTimeRange(t.start, t.end);
  const late = !t.done && t.date < today;
  if (t.date === today && !alwaysDate) return { text: time, late: false };
  const day = taskDayLabel(t.date, today);
  return { text: (late ? 'Overdue · ' : '') + day + ' · ' + time, late };
}

// 'red' | 'orange' | 'yellow' | 'done'
//  overdue, or today and the time window has passed / starts within 2 hours -> red
//  today (later) or tomorrow -> orange
//  further out -> yellow
function taskPriority(t, today, nowMin) {
  if (t.done) return 'done';
  if (t.date < today) return 'red';
  if (t.date === today) {
    if (t.allDay) return Math.floor(nowMin / 60) >= EVENING_HOUR ? 'red' : 'orange';
    if (nowMin >= parseHM(t.end)) return 'red';
    if (nowMin >= parseHM(t.start) - TASK_SOON_MINUTES) return 'red';
    return 'orange';
  }
  return t.date === shiftDay(today, 1) ? 'orange' : 'yellow';
}
