// Builds one task card (name, clock + time, optional edit pencil, tick).
// opts: { manage: show the edit pencil, alwaysDate: always show the day,
//         onChange: called after the tick is toggled }
function buildTaskCard(t, opts) {
  opts = opts || {};
  const li = document.createElement('li');
  li.dataset.id = t.id;

  const info = document.createElement('div');
  info.className = 'info';
  const name = document.createElement('div');
  name.className = 'name';
  name.textContent = t.name;

  const meta = document.createElement('div');
  meta.className = 'meta';
  const clock = document.createElement('span');
  clock.className = 'clock';
  clock.innerHTML = ICON_CLOCK;
  const metaText = document.createElement('span');
  meta.append(clock, metaText);
  info.append(name, meta);
  li.appendChild(info);

  if (opts.manage) {
    const edit = document.createElement('a');
    edit.className = 'icon-btn';
    edit.href = 'edit-task.html?id=' + encodeURIComponent(t.id);
    edit.setAttribute('aria-label', 'Edit ' + t.name);
    edit.innerHTML = ICON_PENCIL;
    li.appendChild(edit);
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'tick';
  li.appendChild(btn);

  function refresh() {
    const cur = Tasks.get(t.id) || t;
    const m = taskMeta(cur, TODAY, !!opts.alwaysDate);
    metaText.textContent = m.text;
    meta.classList.toggle('late', m.late);

    btn.setAttribute('aria-pressed', !!cur.done);
    btn.setAttribute('aria-label', (cur.done ? 'Mark not done: ' : 'Mark done: ') + t.name);
    btn.textContent = cur.done ? '\u2713' : '';

    li.dataset.pri = taskPriority(cur, TODAY, nowMinutes());
  }

  btn.addEventListener('click', () => {
    Tasks.toggle(t.id);
    refresh();
    if (opts.onChange) opts.onChange();
  });

  refresh();
  return li;
}
