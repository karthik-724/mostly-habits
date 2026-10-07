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
