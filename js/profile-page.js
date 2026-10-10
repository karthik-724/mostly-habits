const me = Profile.get();
paintAvatar(document.getElementById('avatar'), me);

const nameEl = document.getElementById('profile-name');
if (me.name) {
  nameEl.textContent = me.name;
} else {
  nameEl.textContent = 'Add your name';
  nameEl.classList.add('muted');
}
document.getElementById('profile-since').textContent = sinceText(me.since);

// Appearance (light / dark / system)
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
