// Shared by add.html and edit.html (both pages use the same form markup).
const form = document.getElementById('habit-form');
const nameEl = document.getElementById('name');
const weeklyBox = document.getElementById('weekly-box');
const weekdaysBox = document.getElementById('weekdays-box');
const everyBox = document.getElementById('every-box');
const everyN = document.getElementById('every-n');
const errorEl = document.getElementById('error');

function selectedFreq() {
  return form.querySelector('input[name="freq"]:checked').value;
}

function syncFields() {
  const t = selectedFreq();
  weeklyBox.hidden = t !== 'weekly';
  weekdaysBox.hidden = t !== 'weekdays';
  everyBox.hidden = t !== 'every';
}
form.querySelectorAll('input[name="freq"]').forEach(r => r.addEventListener('change', syncFields));
syncFields();

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

function buildFreq() {
  const t = selectedFreq();
  if (t === 'daily') return { type: 'daily' };

  if (t === 'weekly') {
    const n = parseInt(form.querySelector('input[name="wk"]:checked').value, 10);
    return { type: 'weekly', n };
  }

  if (t === 'every') {
    const n = parseInt(everyN.value, 10);
    if (!n || n < 2 || n > 30) { showError('Enter a number of days between 2 and 30.'); return null; }
    return { type: 'every', n };
  }

  const days = [...weekdaysBox.querySelectorAll('input:checked')].map(i => parseInt(i.value, 10));
  if (!days.length) { showError('Pick at least one day of the week.'); return null; }
  return { type: 'weekdays', days };
}

// Returns { name, freq } or null (after showing an error).
function readForm() {
  errorEl.hidden = true;
  const name = nameEl.value.trim();
  if (!name) { showError('Give your habit a name.'); nameEl.focus(); return null; }
  const freq = buildFreq();
  if (!freq) return null;
  return { name, freq };
}

// Pre-fill the form from an existing habit (used by edit.html).
function fillForm(habit) {
  nameEl.value = habit.name;
  const f = habit.freq;
  form.querySelector('input[name="freq"][value="' + f.type + '"]').checked = true;
  if (f.type === 'weekly') {
    form.querySelector('input[name="wk"][value="' + f.n + '"]').checked = true;
  } else if (f.type === 'weekdays') {
    weekdaysBox.querySelectorAll('input').forEach(cb => {
      cb.checked = f.days.includes(parseInt(cb.value, 10));
    });
  } else if (f.type === 'every') {
    everyN.value = f.n;
  }
  syncFields();
}
