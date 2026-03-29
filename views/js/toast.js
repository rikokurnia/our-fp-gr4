(function () {
  function ensureToastRoot() {
    let root = document.getElementById('toast-root');
    if (root) return root;

    root = document.createElement('div');
    root.id = 'toast-root';
    root.className = 'toast-root';
    document.body.appendChild(root);
    return root;
  }

  function showToast(message, type) {
    const root = ensureToastRoot();
    const item = document.createElement('div');
    item.className = `toast-item toast-${type || 'info'}`;
    item.textContent = message;

    root.appendChild(item);

    requestAnimationFrame(function () {
      item.classList.add('is-visible');
    });

    setTimeout(function () {
      item.classList.remove('is-visible');
      setTimeout(function () {
        item.remove();
      }, 220);
    }, 2600);
  }

  window.showToast = showToast;
})();
