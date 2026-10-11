dateEl.min = TODAY;

form.addEventListener('submit', e => {
  e.preventDefault();
  const v = readTaskForm();
  if (!v) return;
  if (v.date < TODAY) { showError('The deadline cannot be in the past.'); return; }

  Tasks.add({
    id: Date.now().toString(36),
    name: v.name,
    date: v.date,
    allDay: v.allDay,
    start: v.start,
    end: v.end,
    done: false,
    createdAt: new Date().toISOString()
  });
  window.location.href = 'tasks.html';
});
