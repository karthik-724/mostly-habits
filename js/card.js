// Builds one habit card. Used by the Home and Habits pages.
// opts: { manage: add a drag handle (reorder) and an edit pencil,
//         showFreq: show frequency line,
//         weekCount: show "done/N" for N-times-a-week habits,
//         onChange: called after the tick is toggled }
const TODAY = toDateStr(new Date());

function streakText(n) {
  if (n === 0) return 'No streak yet';
  return '\u{1F525} ' + n + (n === 1 ? ' day' : ' days');
}

function buildCard(h, opts) {
  opts = opts || {};
  const li = document.createElement('li');
  li.dataset.id = h.id;

  if (opts.manage) {
    const grip = document.createElement('button');
    grip.type = 'button';
    grip.className = 'grip-btn';
    grip.setAttribute('aria-label',
      'Reorder ' + h.name + '. Press and hold to drag, or use the up and down arrow keys.');
    const dots = document.createElement('span');
    dots.className = 'grip';
    grip.appendChild(dots);
    li.appendChild(grip);
  }

  const info = document.createElement('div');
  info.className = 'info';

  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = h.name;
  info.appendChild(name);

  if (opts.showFreq) {
    const freq = document.createElement('div');
    freq.className = 'freq';
    freq.textContent = describeFreq(h.freq);
    info.appendChild(freq);
  }

  const streak = document.createElement('div');
  streak.className = 'streak';
  info.appendChild(streak);
  li.appendChild(info);

  let count = null;
  if (opts.weekCount) {
    count = document.createElement('span');
    count.className = 'count';
    li.appendChild(count);
  }

  if (opts.manage) {
    const edit = document.createElement('a');
    edit.className = 'icon-btn';
    edit.href = 'edit.html?id=' + encodeURIComponent(h.id);
    edit.setAttribute('aria-label', 'Edit ' + h.name);
    edit.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
    li.appendChild(edit);
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tick';
  li.appendChild(btn);

  function refresh() {
    const dates = Logs.dates(h.id);
    const done = dates.includes(TODAY);
    const n = calcStreak(h, dates, TODAY);

    btn.setAttribute('aria-pressed', done);
    btn.setAttribute('aria-label', (done ? 'Undo done: ' : 'Mark done: ') + h.name);
    btn.textContent = done ? '\u2713' : '';

    streak.textContent = streakText(n);
    streak.classList.toggle('none', n === 0);
    if (n > 0) streak.setAttribute('aria-label', n + (n === 1 ? ' day streak' : ' day streak'));
    else streak.removeAttribute('aria-label');

    if (count) {
      count.textContent = weekDoneCount(dates, TODAY) + '/' + h.freq.n;
      count.setAttribute('aria-label', count.textContent.replace('/', ' of ') + ' this week');
    }

    li.dataset.pri = priorityFor(h, dates, TODAY, new Date().getHours());
  }

  btn.addEventListener('click', () => {
    Logs.toggle(h.id, TODAY);
    refresh();
    if (opts.onChange) opts.onChange();
  });

  refresh();
  return li;
}

// If the app stays open past midnight, reload so "today" is correct.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && toDateStr(new Date()) !== TODAY) location.reload();
});
