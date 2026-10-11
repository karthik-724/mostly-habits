// The + button on the Tasks page opens a small tile: Task or List.
(function () {
  const fab = document.getElementById('fab');
  const menu = document.getElementById('add-menu');
  const items = [...menu.querySelectorAll('.menu-item')];

  // little icons in front of the labels
  [ICON_TASK, ICON_LIST].forEach((svg, i) => items[i].insertAdjacentHTML('afterbegin', svg));

  function setOpen(open, returnFocus) {
    menu.hidden = !open;
    fab.setAttribute('aria-expanded', open);
    if (open) items[0].focus();
    else if (returnFocus) fab.focus();
  }

  fab.addEventListener('click', () => setOpen(menu.hidden));
  document.addEventListener('click', e => {
    if (!menu.hidden && !menu.contains(e.target) && !fab.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) setOpen(false, true);
  });
  menu.addEventListener('keydown', e => {
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  });
  // coming back with the browser's back button should not show it open
  window.addEventListener('pageshow', () => setOpen(false));
})();
