const taskList = document.getElementById('task-list');
const doneList = document.getElementById('done-list');
const doneSection = document.getElementById('done-section');
const emptyEl = document.getElementById('empty');

function render() {
  const all = Tasks.all();
  const open = sortTasks(all.filter(t => !t.done));
  const done = sortTasks(all.filter(t => t.done)).reverse(); // latest first

  taskList.replaceChildren();
  doneList.replaceChildren();
  const opts = { manage: true, alwaysDate: true, onChange: render };
  open.forEach(t => taskList.appendChild(buildTaskCard(t, opts)));
  done.forEach(t => doneList.appendChild(buildTaskCard(t, opts)));

  emptyEl.hidden = all.length > 0;
  doneSection.hidden = done.length === 0;
}
render();
