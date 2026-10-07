// Bottom navigation. Each page sets <body data-page="home|habits">.
(function () {
  const tabs = [
    { id: 'home', label: 'Home', href: 'index.html' },
    { id: 'habits', label: 'Habits', href: 'habits.html' }
  ];
  const nav = document.createElement('nav');
  nav.className = 'nav';
  nav.setAttribute('aria-label', 'Main');
  tabs.forEach(t => {
    const a = document.createElement('a');
    a.href = t.href;
    a.textContent = t.label;
    if (document.body.dataset.page === t.id) a.setAttribute('aria-current', 'page');
    nav.appendChild(a);
  });
  document.body.appendChild(nav);
})();
