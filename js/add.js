form.addEventListener('submit', e => {
  e.preventDefault();
  const values = readForm();
  if (!values) return;

  Store.add({
    id: Date.now().toString(36),
    name: values.name,
    freq: values.freq,
    createdAt: new Date().toISOString()
  });
  window.location.href = 'habits.html';
});
