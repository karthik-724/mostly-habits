const taskList = document.getElementById('task-list');
const doneList = document.getElementById('done-list');
const doneSection = document.getElementById('done-section');
const emptyEl = document.getElementById('empty');
const tasksView = document.getElementById('tasks-view');
const listsView = document.getElementById('lists-view');
const listOfLists = document.getElementById('list-of-lists');
const listsEmpty = document.getElementById('lists-empty');
const chipTasks = document.getElementById('chip-tasks');
const chipLists = document.getElementById('chip-lists');

// ---- Tasks ----
function renderTasks() {
  const all = Tasks.all();
  const open = sortTasks(all.filter(t => !t.done));
  const done = sortTasks(all.filter(t => t.done)).reverse(); // latest first

  taskList.replaceChildren();
  doneList.replaceChildren();
  const opts = { manage: true, alwaysDate: true, onChange: renderTasks };
  open.forEach(t => taskList.appendChild(buildTaskCard(t, opts)));
  done.forEach(t => doneList.appendChild(buildTaskCard(t, opts)));

  emptyEl.hidden = all.length > 0;
  doneSection.hidden = done.length === 0;
}

// ---- Lists ----
function buildListCard(l) {
  const li = document.createElement('li');
  li.className = 'list-card';

  const link = document.createElement('a');
  link.className = 'list-link';
  link.href = 'list.html?id=' + encodeURIComponent(l.id);

  const icon = document.createElement('span');
  icon.className = 'list-ico';
  icon.innerHTML = ICON_LIST;

  const text = document.createElement('span');
  text.className = 'list-text';
  const name = document.createElement('span');
  name.className = 'name';
  name.textContent = l.name;
  const n = l.items.length;
  const count = document.createElement('span');
  count.className = 'freq';
  count.textContent = n === 0 ? 'No items' : n + (n === 1 ? ' item' : ' items');
  text.append(name, count);

  link.append(icon, text);
  li.appendChild(link);
  return li;
}

function renderLists() {
  const all = Lists.all();
  listOfLists.replaceChildren();
  all.forEach(l => listOfLists.appendChild(buildListCard(l)));
  listsEmpty.hidden = all.length > 0;
}

// ---- Chips: Tasks | Lists (the page title stays "Tasks") ----
function showView(view) {
  const lists = view === 'lists';
  tasksView.hidden = lists;
  listsView.hidden = !lists;
  chipTasks.setAttribute('aria-pressed', !lists);
  chipLists.setAttribute('aria-pressed', lists);
  history.replaceState(null, '', lists ? '#lists' : window.location.pathname);
}
chipTasks.addEventListener('click', () => showView('tasks'));
chipLists.addEventListener('click', () => showView('lists'));

renderTasks();
renderLists();
showView(window.location.hash === '#lists' ? 'lists' : 'tasks');
