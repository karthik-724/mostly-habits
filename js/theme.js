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
