// Profile storage and helpers. Needs store.js (for Store) loaded first.
// Profile shape: { name, icon, dob: 'YYYY-MM-DD' | '', since: ISO date }
const ICONS = [
  { id: 'initial', label: 'First letter of your name' },
  { id: 'sprout', label: 'Sprout', glyph: '\u{1F331}' },
  { id: 'flame', label: 'Flame', glyph: '\u{1F525}' },
  { id: 'star', label: 'Star', glyph: '\u2B50' },
  { id: 'moon', label: 'Moon', glyph: '\u{1F319}' }
];
const NO_NAME_GLYPH = '\u{1F464}';

const Profile = {
  KEY: 'mostly.profile',

  get() {
    let p = null;
    try { p = JSON.parse(localStorage.getItem(this.KEY)); } catch (e) { p = null; }
    p = p || {};
    const needsSave = !p.since;
    const profile = {
      name: p.name || '',
      icon: p.icon || 'initial',
      dob: p.dob || '',
      since: p.since || firstUseDate()
    };
    if (needsSave) this.save(profile);
    return profile;
  },

  save(profile) {
    localStorage.setItem(this.KEY, JSON.stringify(profile));
  }
};

// Earliest habit if there is one (so existing users keep their real start), else now.
function firstUseDate() {
  const created = Store.all().map(h => h.createdAt).filter(Boolean).sort();
  return created.length ? created[0] : new Date().toISOString();
}

function avatarGlyph(name, icon) {
  const chosen = ICONS.find(i => i.id === icon);
  if (chosen && chosen.glyph) return chosen.glyph;
  const first = Array.from((name || '').trim())[0];
  return first ? first.toUpperCase() : NO_NAME_GLYPH;
}

function paintAvatar(el, profile) {
  el.textContent = avatarGlyph(profile.name, profile.icon);
}

function sinceText(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return 'Started using Mostly today';
  let span;
  if (days < 60) span = days + (days === 1 ? ' day' : ' days');
  else if (days < 365) span = Math.floor(days / 30) + ' months';
  else {
    const y = Math.floor(days / 365);
    span = y + (y === 1 ? ' year' : ' years');
  }
  return 'Using Mostly for ' + span;
}

// today is 'YYYY-MM-DD'. A 29 Feb birthday is celebrated on 28 Feb in non-leap years.
function isBirthdayToday(dob, today) {
  if (!dob) return false;
  let md = dob.slice(5);
  const y = parseInt(today.slice(0, 4), 10);
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  if (md === '02-29' && !leap) md = '02-28';
  return md === today.slice(5);
}

// Top-right button used on Home and Habits.
(function () {
  const btn = document.getElementById('profile-btn');
  if (btn) paintAvatar(btn, Profile.get());
})();
