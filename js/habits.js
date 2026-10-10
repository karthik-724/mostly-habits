const listEl = document.getElementById('habit-list');
const emptyEl = document.getElementById('empty');

const habits = Store.all();
emptyEl.hidden = habits.length > 0;
habits.forEach(h => listEl.appendChild(buildCard(h, { manage: true, showFreq: true })));

enableReorder(listEl, ids => Store.reorder(ids));
