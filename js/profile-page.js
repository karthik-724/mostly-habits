function renderProfile() {
  const me = Profile.get();
  paintAvatar(document.getElementById('avatar'), me);

  const nameEl = document.getElementById('profile-name');
  nameEl.classList.toggle('muted', !me.name);
  nameEl.textContent = me.name || 'Add your name';
  document.getElementById('profile-since').textContent = sinceText(me.since);

  const top = document.getElementById('profile-btn');
  if (top) paintAvatar(top, me);
}
renderProfile();

// ---- Appearance (light / dark / system) ----
const themeEl = document.getElementById('theme-options');
const currentTheme = Theme.get();
Theme.OPTIONS.forEach(o => {
  const label = document.createElement('label');
  label.className = 'seg';

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'theme';
  input.value = o.id;
  input.checked = currentTheme === o.id;
  input.addEventListener('change', () => Theme.set(o.id));

  const face = document.createElement('span');
  face.textContent = o.label;

  label.append(input, face);
  themeEl.appendChild(label);
});

// ---- Backup ----
const statusEl = document.getElementById('backup-status');
const lastEl = document.getElementById('backup-last');
const fileEl = document.getElementById('import-file');

function say(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = 'status' + (kind ? ' ' + kind : '');
}

function showLastBackup() {
  const iso = localStorage.getItem(LAST_BACKUP_KEY);
  lastEl.textContent = iso
    ? 'Last backup: ' + new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : 'You haven\u2019t made a backup yet.';
}
showLastBackup();

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.getElementById('export-btn').addEventListener('click', () => {
  const file = buildBackupFile();
  download(file.name, file.text);
  localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
  showLastBackup();
  say('Saved ' + file.name, 'ok');
});

document.getElementById('import-btn').addEventListener('click', () => fileEl.click());

fileEl.addEventListener('change', () => {
  const file = fileEl.files && fileEl.files[0];
  fileEl.value = ''; // so choosing the same file again still works
  if (!file) return;
  if (file.size > BACKUP_MAX_BYTES) { say('That file is too large to be a backup.', 'error'); return; }

  const reader = new FileReader();
  reader.onerror = () => say('Could not read that file.', 'error');
  reader.onload = () => {
    const result = parseBackup(String(reader.result));
    if (!result.ok) { say(result.error, 'error'); return; }

    const from = result.exportedAt
      ? ' from ' + new Date(result.exportedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    const proceed = confirm(
      'Replace everything on this device with this backup?\n\n' +
      'Backup' + from + ': ' + describeData(result.data) + '.\n' +
      'This device now: ' + describeData(currentData()) + '.\n\n' +
      'This cannot be undone.'
    );
    if (!proceed) { say('Import cancelled. Nothing was changed.'); return; }

    if (restoreBackup(result.data)) {
      renderProfile();
      say('Restored ' + describeData(result.data) + '.', 'ok');
    } else {
      say('Could not save the backup (storage is full or blocked). Nothing was changed.', 'error');
    }
  };
  reader.readAsText(file);
});
