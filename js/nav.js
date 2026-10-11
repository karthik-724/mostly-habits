// Bottom navigation: an icon with a small label under it, like a phone app.
// Each page sets <body data-page="home|tasks|habits|timers">.
(function () {
  const tabs = [
    { id: 'home', label: 'Home', href: 'index.html',
      icon: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>' },
    { id: 'tasks', label: 'Tasks', href: 'tasks.html',
      icon: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 9.5"/>' },
    { id: 'habits', label: 'Habits', href: 'habits.html',
      icon: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>' },
    { id: 'timers', label: 'Timers', href: 'timers.html',
      icon: '<circle cx="12" cy="14" r="7.5"/><path d="M12 10.5V14l2.2 1.4"/><path d="M12 6.5v-4"/><path d="M10 2.5h4"/>' }
  ];
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.setAttribute('aria-label', 'Main');
  tabs.forEach(t => {
    const a = document.createElement('a');
    a.href = t.href;
    a.innerHTML =
      '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      t.icon + '</svg><span>' + t.label + '</span>';
    if (document.body.dataset.page === t.id) a.setAttribute('aria-current', 'page');
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
})();
