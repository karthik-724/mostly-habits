// Builds one habit card. Used by the Home and Habits pages.
// opts: { link: name area opens the edit page, showFreq: show frequency line,
//         weekCount: show "done/N" for N-times-a-week habits }
const TODAY = toDateStr(new Date());

function streakText(n) {
  if (n === 0) return 'No streak yet';
  return n + (n === 1 ? ' day' : ' days') + ' streak';
}

function buildCard(h, opts) {
  opts = opts || {};
  const li = document.createElement('li');

  const info = document.createElement(opts.link ? 'a' : 'div');
  info.className = 'info';
  if (opts.link) info.href = 'edit.html?id=' + encodeURIComponent(h.id);

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

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tick';
  li.appendChild(btn);

  function refresh() {
    const dates = Logs.dates(h.id);
    const done = dates.includes(TODAY);
    btn.setAttribute('aria-pressed', done);
    btn.setAttribute('aria-label', (done ? 'Undo done: ' : 'Mark done: ') + h.name);
    btn.textContent = done ? '\u2713' : '';
    streak.textContent = streakText(calcStreak(h, dates, TODAY));
    if (count) {
      count.textContent = weekDoneCount(dates, TODAY) + '/' + h.freq.n;
      count.setAttribute('aria-label', count.textContent.replace('/', ' of ') + ' this week');
    }
  }

  btn.addEventListener('click', () => {
    Logs.toggle(h.id, TODAY);
    refresh();
  });

  refresh();
  return li;
}

// If the app stays open past midnight, reload so "today" is correct.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && toDateStr(new Date()) !== TODAY) location.reload();
});
