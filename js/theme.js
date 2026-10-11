// Loaded in <head> on every page so the theme is applied before first paint.
const Theme = {
  KEY: 'mostly.theme',
  OPTIONS: [
    { id: 'system', label: 'System' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' }
  ],

  get() {
    try {
      const v = localStorage.getItem(this.KEY);
      return this.OPTIONS.some(o => o.id === v) ? v : 'system';
    } catch (e) { return 'system'; }
  },

  set(value) {
    try { localStorage.setItem(this.KEY, value); } catch (e) { /* ignore */ }
    this.apply(value);
  },

  apply(value) {
    const root = document.documentElement;
    if (value === 'light' || value === 'dark') root.dataset.theme = value;
    else delete root.dataset.theme; // follow the system
  }
};
Theme.apply(Theme.get());

// Colour the browser/status bar on phones to match the page.
// (These must match --bar-bg and --bg in style.css.)
(function () {
  const COLORS = {
    light: { bar: '#1b7f5c', page: '#f7f6f2' },
    dark: { bar: '#12211b', page: '#0a0a0a' }
  };
  const query = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function paint() {
    const t = document.documentElement.dataset.theme;
    const dark = t === 'dark' || (t !== 'light' && !!query && query.matches);
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    const set = COLORS[dark ? 'dark' : 'light'];
    meta.content = document.querySelector('.topbar') ? set.bar : set.page;
  }

  const apply = Theme.apply.bind(Theme);
  Theme.apply = function (value) { apply(value); paint(); };
  document.addEventListener('DOMContentLoaded', paint);
  if (query && query.addEventListener) query.addEventListener('change', paint);
  paint();
})();
