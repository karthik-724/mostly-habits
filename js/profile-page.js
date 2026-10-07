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
