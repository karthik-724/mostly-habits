// Shared by add-task.html and edit-task.html.
const form = document.getElementById('task-form');
const nameEl = document.getElementById('name');
const dateEl = document.getElementById('date');
const timeBox = document.getElementById('time-box');
const startEl = document.getElementById('start');
const endEl = document.getElementById('end');
const errorEl = document.getElementById('error');

function pad2(n) { return String(n).padStart(2, '0'); }

// Default start = the next full hour, end = one hour later.
const defaultHour = Math.min(new Date().getHours() + 1, 22);
startEl.value = pad2(defaultHour) + ':00';
endEl.value = pad2(defaultHour + 1) + ':00';
dateEl.value = TODAY;

function isTimed() {
  return form.querySelector('input[name="time"]:checked').value === 'timed';
}

function syncTime() { timeBox.hidden = !isTimed(); }
form.querySelectorAll('input[name="time"]').forEach(r => r.addEventListener('change', syncTime));
syncTime();

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

// Returns { name, date, allDay, start, end } or null (after showing an error).
function readTaskForm() {
  errorEl.hidden = true;
  const name = nameEl.value.trim();
  if (!name) { showError('Give your task a name.'); nameEl.focus(); return null; }
  if (!dateEl.value) { showError('Pick a deadline date.'); dateEl.focus(); return null; }

  if (!isTimed()) return { name, date: dateEl.value, allDay: true, start: '', end: '' };

  if (!startEl.value || !endEl.value) { showError('Set both a start and an end time.'); return null; }
  if (parseHM(endEl.value) <= parseHM(startEl.value)) {
    showError('The end time must be after the start time.');
    return null;
  }
  return { name, date: dateEl.value, allDay: false, start: startEl.value, end: endEl.value };
}

// Pre-fill the form from an existing task (edit page).
function fillTaskForm(t) {
  nameEl.value = t.name;
  dateEl.value = t.date;
  form.querySelector('input[name="time"][value="' + (t.allDay ? 'allday' : 'timed') + '"]').checked = true;
  if (!t.allDay) { startEl.value = t.start; endEl.value = t.end; }
  syncTime();
}
