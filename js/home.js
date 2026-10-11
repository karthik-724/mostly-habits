const todayList = document.getElementById('today-list');
const todayEmpty = document.getElementById('today-empty');
const progressEl = document.getElementById('today-progress');
const weekSection = document.getElementById('week-section');
const weekList = document.getElementById('week-list');

const me = Profile.get();
const habits = Store.all();
const tasks = Tasks.all();

// Greeting
document.getElementById('greeting').textContent = me.name ? 'Hi, ' + me.name : 'Hi there';
document.getElementById('today-date').textContent =
  new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

const birthdayEl = document.getElementById('birthday');
if (isBirthdayToday(me.dob, TODAY)) {
  birthdayEl.textContent = 'Happy birthday' + (me.name ? ', ' + me.name : '') + '!';
  birthdayEl.hidden = false;
}

// Sort habits and tasks into Today / This week
const dueHabits = [];
const weeklyHabits = [];
habits.forEach(h => {
  if (h.freq.type === 'weekly') weeklyHabits.push(h);
  else if (isDueToday(h, Logs.dates(h.id), TODAY)) dueHabits.push(h);
});

const todayTasks = sortTasks(tasks.filter(t => taskBucket(t, TODAY) === 'today'));
const weekTasks = sortTasks(tasks.filter(t => taskBucket(t, TODAY) === 'week'));

function updateProgress() {
  const total = dueHabits.length + todayTasks.length;
  const done = dueHabits.filter(h => Logs.has(h.id, TODAY)).length +
    todayTasks.filter(t => (Tasks.get(t.id) || {}).done).length;
  progressEl.textContent = done + ' of ' + total + ' done';
}

// Habits first, then tasks (overdue and earliest first)
dueHabits.forEach(h => todayList.appendChild(buildCard(h, { onChange: updateProgress })));
todayTasks.forEach(t => todayList.appendChild(buildTaskCard(t, { onChange: updateProgress })));

weeklyHabits.forEach(h => weekList.appendChild(buildCard(h, { weekCount: true })));
weekTasks.forEach(t => weekList.appendChild(buildTaskCard(t, { alwaysDate: true })));

const todayTotal = dueHabits.length + todayTasks.length;
todayEmpty.textContent = habits.length + tasks.length === 0
  ? 'Nothing here yet. Add habits or tasks from the tabs below.'
  : 'Nothing due today.';
todayEmpty.hidden = todayTotal > 0;
progressEl.hidden = todayTotal === 0;
weekSection.hidden = weeklyHabits.length + weekTasks.length === 0;
updateProgress();
