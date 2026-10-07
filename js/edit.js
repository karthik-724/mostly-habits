const habitId = new URLSearchParams(window.location.search).get('id');
const habit = habitId ? Store.get(habitId) : null;

if (!habit) {
  window.location.replace('habits.html');
} else {
  fillForm(habit);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const values = readForm();
    if (!values) return;
    Store.update(habit.id, { name: values.name, freq: values.freq });
    window.location.href = 'habits.html';
  });

  document.getElementById('delete-btn').addEventListener('click', () => {
    if (!confirm('Do you want to delete "' + habit.name + '"?')) return;

    const streak = calcStreak(habit, Logs.dates(habit.id), toDateStr(new Date()));
    if (streak > 1) {
      const ok = confirm(
        'You have already done "' + habit.name + '" for ' + streak + ' days.\n\n' +
        'Are you sure you want to delete it?'
      );
      if (!ok) return;
    }

    Store.remove(habit.id);
    window.location.href = 'habits.html';
  });
}
