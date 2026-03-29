(function () {
  function initMobileNav() {
    const nav = document.querySelector('[data-mobile-nav]');
    if (!nav) return;

    const indicator = nav.querySelector('[data-nav-indicator]');
    const items = Array.from(nav.querySelectorAll('[data-nav-item]'));
    if (!items.length || !indicator) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';

    let activeIndex = items.findIndex((item) => item.getAttribute('data-nav-item') === currentPath);
    if (activeIndex < 0) activeIndex = 0;

    function applyActiveState(index) {
      items.forEach((item, itemIndex) => {
        const icon = item.querySelector('.material-symbols-outlined');
        const label = item.querySelector('[data-nav-label]');
        const isActive = itemIndex === index;

        item.classList.toggle('text-[#00712D]', isActive);
        item.classList.toggle('text-[#1d1c10]', !isActive);
        item.classList.toggle('opacity-100', isActive);
        item.classList.toggle('opacity-60', !isActive);

        if (icon) {
          icon.style.fontVariationSettings = isActive
            ? "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
            : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
        }

        if (label) {
          label.classList.toggle('font-bold', isActive);
          label.classList.toggle('font-medium', !isActive);
        }
      });

      const activeItem = items[index];
      indicator.style.width = activeItem.offsetWidth + 'px';
      indicator.style.transform = `translateX(${activeItem.offsetLeft}px)`;
    }

    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        applyActiveState(index);
      });
    });

    window.addEventListener('resize', function () {
      applyActiveState(activeIndex);
    });

    requestAnimationFrame(function () {
      applyActiveState(activeIndex);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
