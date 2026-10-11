// Storage + shared helpers. Habit shape:
// { id, name, freq: { type: 'daily' | 'weekly' | 'every' | 'weekdays', n?, days? }, createdAt }
const Store = {
  KEY: 'mostly.habits',

  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch (e) { return []; }
  },

  _save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },

  get(id) { return this.all().find(h => h.id === id) || null; },

  add(habit) {
    const list = this.all();
    list.push(habit);
    this._save(list);
  },

  update(id, changes) {
    const list = this.all().map(h => (h.id === id ? Object.assign({}, h, changes) : h));
    this._save(list);
  },

  // Saves a new order. `ids` is the full list of habit ids in the order you want.
  reorder(ids) {
    const all = this.all();
    const byId = new Map(all.map(h => [h.id, h]));
    const next = ids.map(id => byId.get(id)).filter(Boolean);
    all.forEach(h => { if (!ids.includes(h.id)) next.push(h); }); // never lose a habit
    this._save(next);
  },

  // Removes the habit and its completion history.
  remove(id) {
    this._save(this.all().filter(h => h.id !== id));
    Logs.remove(id);
  }
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function describeFreq(f) {
  if (f.type === 'daily') return 'Every day';
  if (f.type === 'weekly') return f.n === 1 ? 'Once a week' : f.n + ' times a week';
  if (f.type === 'every') return f.n === 2 ? 'Alternate days' : 'Once every ' + f.n + ' days';
  if (f.type === 'weekdays') {
    const order = [1, 2, 3, 4, 5, 6, 0];
    return order.filter(d => f.days.includes(d)).map(d => DAY_NAMES[d]).join(', ');
  }
  return '';
}

// Completion log: { habitId: ['2026-10-07', ...] } (local dates)
const Logs = {
  KEY: 'mostly.logs',

  _read() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
    catch (e) { return {}; }
  },

  dates(id) { return this._read()[id] || []; },

  has(id, date) { return this.dates(id).includes(date); },

  // Marks several days done at once (used when a habit is started in the past).
  addMany(id, dates) {
    const all = this._read();
    const set = new Set(all[id] || []);
    dates.forEach(d => set.add(d));
    all[id] = [...set].sort();
    localStorage.setItem(this.KEY, JSON.stringify(all));
  },

  remove(id) {
    const all = this._read();
    delete all[id];
    localStorage.setItem(this.KEY, JSON.stringify(all));
  },

  // Returns true if the day is now marked done, false if it was unmarked.
  toggle(id, date) {
    const all = this._read();
    const list = all[id] || [];
    const i = list.indexOf(date);
    if (i === -1) list.push(date); else list.splice(i, 1);
    all[id] = list;
    localStorage.setItem(this.KEY, JSON.stringify(all));
    return i === -1;
  }
};

// Tasks: { id, name, date: 'YYYY-MM-DD', allDay, start: 'HH:MM', end: 'HH:MM', done, createdAt }
const Tasks = {
  KEY: 'mostly.tasks',

  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch (e) { return []; }
  },

  _save(list) { localStorage.setItem(this.KEY, JSON.stringify(list)); },

  get(id) { return this.all().find(t => t.id === id) || null; },

  add(task) {
    const list = this.all();
    list.push(task);
    this._save(list);
  },

  update(id, changes) {
    this._save(this.all().map(t => (t.id === id ? Object.assign({}, t, changes) : t)));
  },

  remove(id) { this._save(this.all().filter(t => t.id !== id)); },

  // Flips done/not done. Returns the new state.
  toggle(id) {
    const list = this.all();
    const t = list.find(x => x.id === id);
    if (!t) return false;
    t.done = !t.done;
    this._save(list);
    return t.done;
  }
};

// Lists: { id, name, items: [{ id, text, done }], createdAt }
const Lists = {
  KEY: 'mostly.lists',

  all() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch (e) { return []; }
  },

  _save(all) { localStorage.setItem(this.KEY, JSON.stringify(all)); },

  get(id) { return this.all().find(l => l.id === id) || null; },

  add(list) {
    const all = this.all();
    all.push(list);
    this._save(all);
  },

  update(id, changes) {
    this._save(this.all().map(l => (l.id === id ? Object.assign({}, l, changes) : l)));
  },

  remove(id) { this._save(this.all().filter(l => l.id !== id)); }
};
