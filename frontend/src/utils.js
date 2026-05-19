export function showNotif(msg) {
  const el = document.getElementById('global-notif');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}
