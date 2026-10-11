const startEl = document.getElementById('start-date');
const MAX_DAYS_BACK = 10;

startEl.max = TODAY;
startEl.min = shiftDay(TODAY, -MAX_DAYS_BACK);
startEl.value = TODAY;

form.addEventListener('submit', e => {
  e.preventDefault();
  const values = readForm();
  if (!values) return;

  const start = startEl.value || TODAY;
  if (start > TODAY || start < startEl.min) {
    showError('Pick a start date within the last ' + MAX_DAYS_BACK + ' days.');
    return;
  }

  const id = Date.now().toString(36);
  Store.add({
    id,
    name: values.name,
    freq: values.freq,
    // Started today: now. Started earlier: midnight of that day.
    createdAt: start === TODAY ? new Date().toISOString() : parseDateStr(start).toISOString()
  });
  const past = backfillDates(values.freq, start, TODAY);
  if (past.length) Logs.addMany(id, past);
  window.location.href = 'habits.html';
});
