/**
 * Smooth horizontal marquee when trust bar content overflows. Clones the track only when needed.
 */
function initTierCuisineTrustBar(root) {
  if (root.hasAttribute('data-tctb-initialized')) return;

  const viewport = root.querySelector('[data-tctb-viewport]');
  const inner = root.querySelector('[data-tctb-inner]');
  const track = root.querySelector('[data-tctb-track]');

  if (!viewport || !inner || !track) return;

  root.setAttribute('data-tctb-initialized', '');

  const designMode = root.dataset.designMode === 'true';

  function removeClone() {
    inner.querySelectorAll('[data-tctb-track-clone]').forEach((el) => el.remove());
    inner.style.removeProperty('--tctb-distance');
    inner.style.removeProperty('--tctb-duration');
    viewport.classList.remove('is-marquee');
  }

  function update() {
    if (designMode) {
      removeClone();
      return;
    }

    removeClone();

    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    window.requestAnimationFrame(() => {
      const overflow = inner.scrollWidth > viewport.clientWidth + 1;

      if (!overflow) {
        return;
      }

      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('data-tctb-track-clone', '');
      clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      inner.appendChild(clone);

      viewport.classList.add('is-marquee');

      window.requestAnimationFrame(() => {
        const shift = clone.offsetLeft;
        if (shift <= 0) {
          removeClone();
          return;
        }

        inner.style.setProperty('--tctb-distance', `${shift}px`);
        const pxPerSecond = 40;
        const duration = Math.max(20, shift / pxPerSecond);
        inner.style.setProperty('--tctb-duration', `${duration}s`);
      });
    });
  }

  update();

  const ro = new ResizeObserver(() => update());
  ro.observe(viewport);
  ro.observe(inner);
  ro.observe(track);
}

function initAll() {
  document.querySelectorAll('[data-tctb]').forEach(initTierCuisineTrustBar);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

document.addEventListener('shopify:section:load', (event) => {
  const section = event.target?.closest?.('shopify-section') ?? event.target;
  const root = section?.querySelector?.('[data-tctb]');
  if (root) initTierCuisineTrustBar(root);
});
