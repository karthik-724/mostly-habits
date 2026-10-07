const form = document.getElementById('profile-form');
const nameEl = document.getElementById('name');
const dobEl = document.getElementById('dob');
const iconsEl = document.getElementById('icons');
const errorEl = document.getElementById('error');

const current = Profile.get();
const todayStr = toDateStr(new Date());

nameEl.value = current.name;
dobEl.value = current.dob;
dobEl.max = todayStr;

// Icon choices
let initialSpan = null;
ICONS.forEach(ic => {
  const label = document.createElement('label');
  label.className = 'icon-opt';
  label.title = ic.label;

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'icon';
  input.value = ic.id;
  input.checked = current.icon === ic.id;
  input.setAttribute('aria-label', ic.label);

  const face = document.createElement('span');
  face.className = 'avatar';
  face.textContent = avatarGlyph(current.name, ic.id);
  if (ic.id === 'initial') initialSpan = face;

  label.append(input, face);
  iconsEl.appendChild(label);
});

// The "initial" choice follows what you type.
nameEl.addEventListener('input', () => {
  initialSpan.textContent = avatarGlyph(nameEl.value, 'initial');
});

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = false;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  errorEl.hidden = true;

  const dob = dobEl.value;
  if (dob && dob > todayStr) { showError('Date of birth cannot be in the future.'); return; }

  Profile.save({
    name: nameEl.value.trim(),
    icon: form.querySelector('input[name="icon"]:checked').value,
    dob: dob,
    since: current.since
  });
  window.location.href = 'profile.html';
});
