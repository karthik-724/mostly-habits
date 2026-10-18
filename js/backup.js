// Backup: save everything to one JSON file, and restore from it.
// File shape: { app: 'mostly-habits', version: 1, exportedAt, data: { habits, logs, tasks, lists, profile } }
const BACKUP_VERSION = 1;
const BACKUP_MAX_BYTES = 5 * 1024 * 1024;
const LAST_BACKUP_KEY = 'mostly.lastBackup';

// what goes in the file -> where it lives in localStorage
const BACKUP_KEYS = {
  habits: 'mostly.habits',
  logs: 'mostly.logs',
  tasks: 'mostly.tasks',
  lists: 'mostly.lists',
  profile: 'mostly.profile'
};
const BACKUP_EMPTY = { habits: [], logs: {}, tasks: [], lists: [], profile: {} };

function readStored(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v === null || v === undefined ? fallback : v;
  } catch (e) { return fallback; }
}

function currentData() {
  const data = {};
  Object.keys(BACKUP_KEYS).forEach(k => { data[k] = readStored(BACKUP_KEYS[k], BACKUP_EMPTY[k]); });
  return data;
}

function buildBackupFile() {
  const now = new Date();
  return {
    name: 'mostly-habits-backup-' + toDateStr(now) + '.json',
    text: JSON.stringify({
      app: 'mostly-habits',
      version: BACKUP_VERSION,
      exportedAt: now.toISOString(),
      data: currentData()
    }, null, 2)
  };
}

// ---- validation (so a bad file can never break the app) ----
const isStr = v => typeof v === 'string';
const isDate = v => isStr(v) && /^\d{4}-\d{2}-\d{2}$/.test(v);
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);

function validHabit(h) {
  return isObj(h) && isStr(h.id) && isStr(h.name) && isObj(h.freq) && isStr(h.createdAt) &&
    ['daily', 'weekly', 'every', 'weekdays'].includes(h.freq.type) &&
    (h.freq.type !== 'weekdays' || Array.isArray(h.freq.days)) &&
    (!['weekly', 'every'].includes(h.freq.type) || Number.isInteger(h.freq.n));
}
function validTask(t) {
  return isObj(t) && isStr(t.id) && isStr(t.name) && isDate(t.date) &&
    (t.allDay || (isStr(t.start) && isStr(t.end)));
}
function validList(l) {
  return isObj(l) && isStr(l.id) && isStr(l.name) && Array.isArray(l.items) &&
    l.items.every(i => isObj(i) && isStr(i.id) && isStr(i.text));
}

// Returns { ok: true, data, exportedAt } or { ok: false, error }.
function parseBackup(text) {
  let obj;
  try { obj = JSON.parse(text); } catch (e) { return { ok: false, error: 'That file is not a valid backup.' }; }
  if (!isObj(obj) || obj.app !== 'mostly-habits' || !isObj(obj.data)) {
    return { ok: false, error: 'That file is not a Mostly habits backup.' };
  }
  if (!Number.isInteger(obj.version) || obj.version > BACKUP_VERSION) {
    return { ok: false, error: 'This backup was made by a newer version of the app.' };
  }

  const d = obj.data;
  const data = {
    habits: d.habits === undefined ? [] : d.habits,
    logs: d.logs === undefined ? {} : d.logs,
    tasks: d.tasks === undefined ? [] : d.tasks,
    lists: d.lists === undefined ? [] : d.lists,
    profile: d.profile === undefined ? {} : d.profile
  };
  const logsOk = isObj(data.logs) && Object.values(data.logs).every(a => Array.isArray(a) && a.every(isDate));
  const ok = Array.isArray(data.habits) && data.habits.every(validHabit) &&
    Array.isArray(data.tasks) && data.tasks.every(validTask) &&
    Array.isArray(data.lists) && data.lists.every(validList) &&
    logsOk && isObj(data.profile);
  if (!ok) return { ok: false, error: 'This backup file looks damaged, so nothing was changed.' };
  return { ok: true, data, exportedAt: isStr(obj.exportedAt) ? obj.exportedAt : '' };
}

function plural(n, word) { return n + ' ' + word + (n === 1 ? '' : 's'); }

function describeData(data) {
  return plural(data.habits.length, 'habit') + ', ' + plural(data.tasks.length, 'task') +
    ', ' + plural(data.lists.length, 'list');
}

// Replaces everything stored on this device. Rolls back if a write fails.
function restoreBackup(data) {
  const keys = Object.keys(BACKUP_KEYS);
  const before = {};
  keys.forEach(k => { before[BACKUP_KEYS[k]] = localStorage.getItem(BACKUP_KEYS[k]); });
  try {
    keys.forEach(k => localStorage.setItem(BACKUP_KEYS[k], JSON.stringify(data[k])));
    return true;
  } catch (e) {
    keys.forEach(k => {
      const old = before[BACKUP_KEYS[k]];
      if (old === null) localStorage.removeItem(BACKUP_KEYS[k]);
      else localStorage.setItem(BACKUP_KEYS[k], old);
    });
    return false;
  }
}
