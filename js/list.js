// One page for both creating a list (list.html) and opening one (list.html?id=...).
// A new list is saved when you press "Create list". An existing list saves as you go.
const listId = new URLSearchParams(window.location.search).get('id');
const existing = listId ? Lists.get(listId) : null;

if (listId && !existing) {
  window.location.replace('tasks.html#lists');
} else {
  initListPage();
}

function initListPage() {
  const isNew = !existing;
  const nameEl = document.getElementById('list-name');
  const openEl = document.getElementById('open-items');
  const checkedEl = document.getElementById('checked-items');
  const checkedSection = document.getElementById('checked-section');
  const checkedLabel = document.getElementById('checked-label');
  const newEl = document.getElementById('new-item');
  const addBtn = document.getElementById('add-item');
  const errorEl = document.getElementById('error');
  const createBtn = document.getElementById('create-list');
  const deleteBtn = document.getElementById('delete-list');

  const state = isNew
    ? { name: '', items: [] }
    : { name: existing.name, items: existing.items.map(i => Object.assign({}, i)) };

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  function persist() {
    if (!isNew) Lists.update(listId, { name: state.name, items: state.items });
  }

  function buildItem(item) {
    const li = document.createElement('li');
    li.dataset.id = item.id;
    if (item.done) li.className = 'is-done';

    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'check';
    check.setAttribute('aria-pressed', item.done);
    check.setAttribute('aria-label', (item.done ? 'Uncheck: ' : 'Check: ') + item.text);
    const box = document.createElement('span');
    box.className = 'box';
    box.textContent = item.done ? '\u2713' : '';
    check.appendChild(box);
    check.addEventListener('click', () => {
      item.done = !item.done;
      persist();
      render();
      const again = document.querySelector('li[data-id="' + item.id + '"] .check');
      if (again) again.focus();
    });

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = item.text;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'item-remove';
    remove.setAttribute('aria-label', 'Remove: ' + item.text);
    remove.textContent = '\u00D7';
    remove.addEventListener('click', () => {
      state.items = state.items.filter(i => i.id !== item.id);
      persist();
      render();
    });

    li.append(check, text, remove);
    return li;
  }

  // Unchecked items on top, checked ones below.
  function render() {
    openEl.replaceChildren();
    checkedEl.replaceChildren();
    const open = state.items.filter(i => !i.done);
    const done = state.items.filter(i => i.done);
    open.forEach(i => openEl.appendChild(buildItem(i)));
    done.forEach(i => checkedEl.appendChild(buildItem(i)));
    checkedSection.hidden = done.length === 0;
    checkedLabel.textContent = 'Checked \u00B7 ' + done.length;
  }

  function addItem() {
    const text = newEl.value.trim();
    if (!text) { newEl.focus(); return; }
    state.items.push({ id: uid(), text, done: false });
    newEl.value = '';
    addBtn.classList.remove('ready');
    persist();
    render();
    newEl.focus();
  }

  addBtn.addEventListener('click', addItem);
  newEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); addItem(); }
  });
  newEl.addEventListener('input', () => addBtn.classList.toggle('ready', newEl.value.trim() !== ''));

  // Name
  nameEl.value = state.name;
  nameEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); newEl.focus(); }
  });
  if (!isNew) {
    nameEl.addEventListener('input', () => {
      const v = nameEl.value.trim();
      if (v) { state.name = v; persist(); }
    });
    nameEl.addEventListener('change', () => {
      if (!nameEl.value.trim()) nameEl.value = state.name; // never leave a list nameless
    });
  }

  if (isNew) {
    createBtn.hidden = false;
    createBtn.addEventListener('click', () => {
      errorEl.hidden = true;
      const name = nameEl.value.trim();
      if (!name) {
        errorEl.textContent = 'Give your list a name.';
        errorEl.hidden = false;
        nameEl.focus();
        return;
      }
      const pending = newEl.value.trim();
      if (pending) state.items.push({ id: uid(), text: pending, done: false });
      Lists.add({ id: uid(), name, items: state.items, createdAt: new Date().toISOString() });
      window.location.href = 'tasks.html#lists';
    });
    nameEl.focus();
  } else {
    deleteBtn.hidden = false;
    deleteBtn.innerHTML = ICON_TRASH;
    deleteBtn.addEventListener('click', () => {
      const n = state.items.length;
      const msg = 'Delete "' + state.name + '"' +
        (n ? ' and its ' + n + (n === 1 ? ' item' : ' items') : '') + '?';
      if (!confirm(msg)) return;
      Lists.remove(listId);
      window.location.href = 'tasks.html#lists';
    });
  }

  render();
}
