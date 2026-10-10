const todayList = document.getElementById('today-list');
const todayEmpty = document.getElementById('today-empty');
const progressEl = document.getElementById('today-progress');
const weekSection = document.getElementById('week-section');
const weekList = document.getElementById('week-list');

const me = Profile.get();
const habits = Store.all();
const dueToday = [];
const weekly = [];

// Greeting
document.getElementById('greeting').textContent = me.name ? 'Hi, ' + me.name : 'Hi there';
document.getElementById('today-date').textContent =
  new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

const birthdayEl = document.getElementById('birthday');
if (isBirthdayToday(me.dob, TODAY)) {
  birthdayEl.textContent = 'Happy birthday' + (me.name ? ', ' + me.name : '') + '!';
  birthdayEl.hidden = false;
}

// Sort habits into Today / This week
habits.forEach(h => {
  if (h.freq.type === 'weekly') weekly.push(h);
  else if (isDueToday(h, Logs.dates(h.id), TODAY)) dueToday.push(h);
});

function updateProgress() {
  const done = dueToday.filter(h => Logs.has(h.id, TODAY)).length;
  progressEl.textContent = done + ' of ' + dueToday.length + ' done';
}

dueToday.forEach(h => todayList.appendChild(buildCard(h, { onChange: updateProgress })));
weekly.forEach(h => weekList.appendChild(buildCard(h, { weekCount: true })));

todayEmpty.textContent = habits.length === 0
  ? 'No habits yet. Add one from the Habits tab.'
  : 'Nothing due today.';
todayEmpty.hidden = dueToday.length > 0;
progressEl.hidden = dueToday.length === 0;
weekSection.hidden = weekly.length === 0;
updateProgress();
