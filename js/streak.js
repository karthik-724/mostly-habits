// Date helpers + streak calculation. Dates are local 'YYYY-MM-DD' strings.
function toDateStr(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}
function parseDateStr(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function shiftDay(s, k) {
  const d = parseDateStr(s);
  d.setDate(d.getDate() + k);
  return toDateStr(d);
}
function dayDiff(a, b) { // a - b in days
  return Math.round((parseDateStr(a) - parseDateStr(b)) / 86400000);
}
function weekStart(s) { // Monday of that week
  const d = parseDateStr(s);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return toDateStr(d);
}

// Streak = number of days completed in the current unbroken run.
// What counts as "broken" depends on the habit's frequency:
//  daily / specific days : a due day passed without being done
//  every N days          : more than N days passed between two completions
//  N times a week        : a finished week (Mon-Sun) with fewer than N completions
function calcStreak(habit, dates, today) {
  if (!dates.length) return 0;
  const done = new Set(dates);
  const created = toDateStr(new Date(habit.createdAt));
  const f = habit.freq;

  if (f.type === 'daily' || f.type === 'weekdays') {
    let count = 0;
    let d = today;
    while (d >= created) {
      const due = f.type === 'daily' || f.days.includes(parseDateStr(d).getDay());
      if (done.has(d)) count++;
      else if (due && d !== today) break; // today is still pending, not missed
      d = shiftDay(d, -1);
    }
    return count;
  }

  if (f.type === 'every') {
    const sorted = [...done].sort().reverse();
    if (dayDiff(today, sorted[0]) > f.n) return 0;
    let count = 1;
    for (let i = 1; i < sorted.length; i++) {
      if (dayDiff(sorted[i - 1], sorted[i]) > f.n) break;
      count++;
    }
    return count;
  }

  if (f.type === 'weekly') {
    const perWeek = {};
    done.forEach(d => { const w = weekStart(d); perWeek[w] = (perWeek[w] || 0) + 1; });
    const thisWeek = weekStart(today);
    const firstWeek = weekStart(created);
    let count = perWeek[thisWeek] || 0;
    let w = shiftDay(thisWeek, -7);
    while (w >= firstWeek) {
      const c = perWeek[w] || 0;
      if (c >= f.n) count += c;
      else { if (w === firstWeek) count += c; break; } // first week is never held against you
      w = shiftDay(w, -7);
    }
    return count;
  }

  return 0;
}

// Is this habit due on `today`? (N-times-a-week habits are handled separately
// on the home page, so they return false here.)
//  daily        : always
//  weekdays     : if today is one of the chosen days
//  every N days : if it was never done and today is on/after the start day, or
//                 N days have passed since the last completion before today.
//                 Stays true once done today so the card keeps showing.
function isDueToday(habit, dates, today) {
  const f = habit.freq;
  if (f.type === 'daily') return true;
  if (f.type === 'weekdays') return f.days.includes(parseDateStr(today).getDay());
  if (f.type === 'every') {
    if (dates.includes(today)) return true;
    const prior = dates.filter(d => d < today).sort();
    const next = prior.length
      ? shiftDay(prior[prior.length - 1], f.n)
      : toDateStr(new Date(habit.createdAt));
    return next <= today;
  }
  return false;
}

// How many days of the current week (Mon-Sun) are marked done.
function weekDoneCount(dates, today) {
  const ws = weekStart(today);
  return dates.filter(d => weekStart(d) === ws).length;
}
