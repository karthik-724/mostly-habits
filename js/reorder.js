// Drag-to-reorder for a list of cards. Press and hold a card's grip (six dots),
// then drag up or down. Keyboard: focus the grip and use the arrow keys.
// Usage: enableReorder(listEl, ids => Store.reorder(ids));
const HOLD_MS = 280;   // how long to hold before the drag starts
const MOVE_SLOP = 10;  // moving more than this (px) before the hold ends cancels it

function enableReorder(list, onSave) {
  let drag = null;
  let raf = 0;

  function save() {
    onSave([...list.children].map(li => li.dataset.id));
  }

  // Put the dragged card where the pointer is, and make it follow the pointer.
  function update() {
    const li = drag.li;
    let before = null;
    for (const el of list.children) {
      if (el === li) continue;
      const r = el.getBoundingClientRect();
      if (drag.cy < r.top + r.height / 2) { before = el; break; }
    }
    if (li.nextElementSibling !== before) list.insertBefore(li, before);

    li.style.transform = '';
    const natural = li.getBoundingClientRect().top;
    li.style.transform = 'translateY(' + (drag.cy - drag.grab - natural) + 'px)';
  }

  function autoScroll() {
    if (!drag || !drag.active) return;
    const edge = 90;
    let dy = 0;
    if (drag.cy < edge) dy = -12;
    else if (drag.cy > window.innerHeight - edge - 60) dy = 12; // keep clear of the nav bar
    if (dy) { window.scrollBy(0, dy); update(); }
    raf = requestAnimationFrame(autoScroll);
  }

  function begin() {
    drag.active = true;
    drag.grab = drag.cy - drag.li.getBoundingClientRect().top;
    drag.li.classList.add('dragging');
    document.body.classList.add('reordering');
    if (navigator.vibrate) navigator.vibrate(15);
    update();
    raf = requestAnimationFrame(autoScroll);
  }

  function finish() {
    if (!drag) return;
    clearTimeout(drag.timer);
    cancelAnimationFrame(raf);
    if (drag.active) {
      drag.li.classList.remove('dragging');
      drag.li.style.transform = '';
      document.body.classList.remove('reordering');
      save();
    }
    drag = null;
  }

  list.addEventListener('pointerdown', e => {
    const handle = e.target.closest('.grip-btn');
    if (!handle || drag) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag = {
      li: handle.closest('li'), active: false,
      sx: e.clientX, sy: e.clientY, cy: e.clientY, grab: 0,
      timer: setTimeout(begin, HOLD_MS)
    };
    try { handle.setPointerCapture(e.pointerId); } catch (err) { /* not supported */ }
  });

  list.addEventListener('pointermove', e => {
    if (!drag) return;
    drag.cy = e.clientY;
    if (drag.active) {
      e.preventDefault();
      update();
    } else if (Math.abs(e.clientX - drag.sx) > MOVE_SLOP || Math.abs(e.clientY - drag.sy) > MOVE_SLOP) {
      clearTimeout(drag.timer); // moved before the hold finished: not a drag
      drag = null;
    }
  });

  list.addEventListener('pointerup', finish);
  list.addEventListener('pointercancel', finish);
  list.addEventListener('contextmenu', e => {
    if (e.target.closest('.grip-btn')) e.preventDefault(); // no long-press menu on the handle
  });

  list.addEventListener('keydown', e => {
    const handle = e.target.closest('.grip-btn');
    if (!handle || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
    e.preventDefault();
    const li = handle.closest('li');
    if (e.key === 'ArrowUp' && li.previousElementSibling) list.insertBefore(li, li.previousElementSibling);
    else if (e.key === 'ArrowDown' && li.nextElementSibling) list.insertBefore(li.nextElementSibling, li);
    else return;
    handle.focus();
    save();
  });
}
