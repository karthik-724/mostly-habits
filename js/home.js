const todayList = document.getElementById('today-list');
const todayEmpty = document.getElementById('today-empty');
const weekSection = document.getElementById('week-section');
const weekList = document.getElementById('week-list');

const habits = Store.all();
let todayCount = 0;
let weekCount = 0;

habits.forEach(h => {
  if (h.freq.type === 'weekly') {
    weekList.appendChild(buildCard(h, { weekCount: true }));
    weekCount++;
  } else if (isDueToday(h, Logs.dates(h.id), TODAY)) {
    todayList.appendChild(buildCard(h));
    todayCount++;
  }
});

todayEmpty.textContent = habits.length === 0
  ? 'No habits yet. Add one from the Habits tab.'
  : 'Nothing due today.';
todayEmpty.hidden = todayCount > 0;
weekSection.hidden = weekCount === 0;

// Birthday wish
const birthdayEl = document.getElementById('birthday');
const me = Profile.get();
if (isBirthdayToday(me.dob, TODAY)) {
  birthdayEl.textContent = 'Happy birthday' + (me.name ? ', ' + me.name : '') + '!';
  birthdayEl.hidden = false;
}
