const taskId = new URLSearchParams(window.location.search).get('id');
const task = taskId ? Tasks.get(taskId) : null;

if (!task) {
  window.location.replace('tasks.html');
} else {
  fillTaskForm(task);

  form.addEventListener('submit', e => {
    e.preventDefault();
    const v = readTaskForm();
    if (!v) return;
    Tasks.update(task.id, v);
    window.location.href = 'tasks.html';
  });

  document.getElementById('delete-btn').addEventListener('click', () => {
    if (!confirm('Do you want to delete "' + task.name + '"?')) return;
    Tasks.remove(task.id);
    window.location.href = 'tasks.html';
  });
}
